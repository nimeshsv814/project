const express = require('express');
const Joi = require('joi');

const Deployment = require('../models/Deployment');
const Prediction = require('../models/Prediction');
const { requireAuth } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');
const { requestPrediction } = require('../services/ml.service');
const { publishEvent } = require('../services/messageQueue.service');
const { gateDecision, deriveRiskLevel } = require('../utils/risk');

const deploymentRouter = express.Router();

deploymentRouter.get('/deployments', requireAuth, async (req, res, next) => {
  try {
    const deployments = await Deployment.find().sort({ updatedAt: -1 }).limit(100);
    return res.json(deployments);
  } catch (err) {
    return next(err);
  }
});

const upsertSchema = Joi.object({
  deploymentId: Joi.string().required(),
  name: Joi.string().required(),
  service: Joi.string()
    .valid('payment-service', 'cart-service', 'inventory-service', 'order-service')
    .required(),
  status: Joi.string().valid('Success', 'Warning', 'Failed').required(),
  git: Joi.object({
    commitCount: Joi.number().required(),
    filesChanged: Joi.number().required(),
    locChanged: Joi.number().required(),
    branch: Joi.string().allow(''),
    commitSha: Joi.string().allow('')
  }).required(),
  kubernetes: Joi.object({
    deploymentYamlHash: Joi.string().allow(''),
    valuesYamlHash: Joi.string().allow(''),
    helmChanges: Joi.number().required(),
    cpuRequest: Joi.number().required(),
    cpuLimit: Joi.number().required(),
    memoryRequest: Joi.number().required(),
    memoryLimit: Joi.number().required()
  }).required(),
  history: Joi.object({
    previousFailures: Joi.number().required(),
    incidents: Joi.number().required()
  }).required(),
  monitoring: Joi.object({
    nodeUtilization: Joi.number().required(),
    latency: Joi.number().required(),
    cpu: Joi.number().required(),
    memory: Joi.number().required(),
    podRestarts: Joi.number().required(),
    responseTime: Joi.number().required()
  }).required()
});

deploymentRouter.post('/deployments', requireAuth, requireRole('Admin', 'DevOps Engineer'), async (req, res, next) => {
  try {
    const { error, value } = upsertSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.message });
    }

    const deployment = await Deployment.findOneAndUpdate(
      { deploymentId: value.deploymentId },
      value,
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    await publishEvent('deployment.updated', {
      deploymentId: deployment.deploymentId,
      service: deployment.service,
      status: deployment.status,
      at: new Date().toISOString()
    });

    return res.status(201).json(deployment);
  } catch (err) {
    return next(err);
  }
});

const gateSchema = Joi.object({
  deploymentId: Joi.string().required()
});

deploymentRouter.post('/deployment/check', requireAuth, requireRole('Admin', 'DevOps Engineer'), async (req, res, next) => {
  try {
    const { error, value } = gateSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.message });
    }

    const deployment = await Deployment.findOne({ deploymentId: value.deploymentId });
    if (!deployment) {
      return res.status(404).json({ message: 'Deployment not found' });
    }

    const payload = {
      deployment_id: deployment.deploymentId,
      service: deployment.service,
      memory_change: deployment.kubernetes.memoryLimit - deployment.kubernetes.memoryRequest,
      cpu_change: deployment.kubernetes.cpuLimit - deployment.kubernetes.cpuRequest,
      commits: deployment.git.commitCount,
      helm_changes: deployment.kubernetes.helmChanges,
      node_usage: deployment.monitoring.nodeUtilization,
      pod_restart: deployment.monitoring.podRestarts,
      latency: deployment.monitoring.latency,
      previous_failures: deployment.history.previousFailures,
      incidents: deployment.history.incidents,
      files_changed: deployment.git.filesChanged,
      loc_changed: deployment.git.locChanged
    };

    const prediction = await requestPrediction(payload);
    const riskLevel = prediction.riskLevel || deriveRiskLevel(prediction.failureProbability || 0);
    const decision = gateDecision(prediction.failureProbability || 0);

    await Prediction.create({
      deploymentId: deployment.deploymentId,
      service: deployment.service,
      features: {
        memoryChange: payload.memory_change,
        cpuChange: payload.cpu_change,
        commits: payload.commits,
        helmChanges: payload.helm_changes,
        nodeUsage: payload.node_usage,
        podRestart: payload.pod_restart,
        latency: payload.latency,
        previousFailures: payload.previous_failures,
        incidents: payload.incidents,
        filesChanged: payload.files_changed,
        locChanged: payload.loc_changed
      },
      failureProbability: prediction.failureProbability,
      riskLevel,
      reasons: prediction.reasons || []
    });

    deployment.lastRiskScore = prediction.failureProbability;
    deployment.lastRiskLevel = riskLevel;
    await deployment.save();

    await publishEvent('deployment.gatechecked', {
      deploymentId: deployment.deploymentId,
      service: deployment.service,
      failureProbability: prediction.failureProbability,
      riskLevel,
      decision,
      at: new Date().toISOString()
    });

    return res.json({
      deploymentId: deployment.deploymentId,
      failureProbability: prediction.failureProbability,
      riskLevel,
      reasons: prediction.reasons || [],
      decision,
      policy: {
        deployIfBelow: 50,
        requireApprovalRange: [50, 80],
        pauseAbove: 80
      }
    });
  } catch (err) {
    return next(err);
  }
});

module.exports = { deploymentRouter };
