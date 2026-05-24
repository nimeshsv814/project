const express = require('express');
const Joi = require('joi');

const { requireAuth } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');
const RemediationAction = require('../models/RemediationAction');
const Incident = require('../models/Incident');
const {
  rollbackDeployment,
  scaleDeployment,
  restartPods,
  scaleNodePoolRecommendation
} = require('../kubernetes/commands');

const remediationRouter = express.Router();

const rollbackSchema = Joi.object({
  deploymentId: Joi.string().required(),
  deploymentName: Joi.string().required()
});

remediationRouter.post('/rollback', requireAuth, requireRole('Admin', 'DevOps Engineer'), async (req, res, next) => {
  try {
    const { error, value } = rollbackSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.message });
    }

    const output = await rollbackDeployment(value.deploymentName);

    const log = await RemediationAction.create({
      deploymentId: value.deploymentId,
      action: 'rollback deployment',
      command: `kubectl rollout undo deployment/${value.deploymentName}`,
      status: 'success',
      output,
      executedBy: req.user.email
    });

    return res.json({ message: 'Rollback triggered', output, logId: log._id });
  } catch (err) {
    return next(err);
  }
});

const autoSchema = Joi.object({
  deploymentId: Joi.string().required(),
  deploymentName: Joi.string().required(),
  selector: Joi.string().required(),
  replicas: Joi.number().integer().min(1).required(),
  nodePoolName: Joi.string().default('defaultpool'),
  nodeCount: Joi.number().integer().min(1).default(3)
});

remediationRouter.post('/remediation/auto', requireAuth, requireRole('Admin', 'DevOps Engineer'), async (req, res, next) => {
  try {
    const { error, value } = autoSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.message });
    }

    const actions = [];

    const rollbackOutput = await rollbackDeployment(value.deploymentName);
    actions.push({
      action: 'rollback deployment',
      command: `kubectl rollout undo deployment/${value.deploymentName}`,
      status: 'success',
      output: rollbackOutput
    });

    const restartOutput = await restartPods(value.selector);
    actions.push({
      action: 'restart pods',
      command: `kubectl delete pod -l app=${value.selector}`,
      status: 'success',
      output: restartOutput
    });

    const scaleOutput = await scaleDeployment(value.deploymentName, value.replicas);
    actions.push({
      action: 'scale deployment',
      command: `kubectl scale deployment/${value.deploymentName} --replicas=${value.replicas}`,
      status: 'success',
      output: scaleOutput
    });

    const nodeRecommendation = await scaleNodePoolRecommendation(value.nodePoolName, value.nodeCount);
    actions.push({
      action: 'scale aks nodes',
      command: `az aks nodepool scale --nodepool-name ${value.nodePoolName} --node-count ${value.nodeCount}`,
      status: 'success',
      output: nodeRecommendation
    });

    const persisted = await Promise.all(
      actions.map((action) =>
        RemediationAction.create({
          deploymentId: value.deploymentId,
          ...action,
          executedBy: req.user.email
        })
      )
    );

    await Incident.findOneAndUpdate(
      { deploymentId: value.deploymentId },
      {
        $set: {
          status: 'resolved',
          remediationActions: actions.map((item) => item.action)
        }
      }
    );

    return res.json({
      message: 'Auto remediation completed',
      actions: persisted
    });
  } catch (err) {
    return next(err);
  }
});

module.exports = { remediationRouter };
