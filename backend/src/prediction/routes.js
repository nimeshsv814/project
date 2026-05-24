const express = require('express');
const Joi = require('joi');

const Prediction = require('../models/Prediction');
const Recommendation = require('../models/Recommendation');
const { requireAuth } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');
const { requestPrediction, requestRecommendation } = require('../services/ml.service');
const { generateRuleBasedRecommendations } = require('../services/recommendation.service');

const predictionRouter = express.Router();

const predictSchema = Joi.object({
  deployment_id: Joi.string().required(),
  service: Joi.string().required(),
  memory_change: Joi.number().required(),
  cpu_change: Joi.number().required(),
  commits: Joi.number().required(),
  helm_changes: Joi.number().required(),
  node_usage: Joi.number().required(),
  pod_restart: Joi.number().required(),
  latency: Joi.number().required(),
  previous_failures: Joi.number().default(0),
  incidents: Joi.number().default(0),
  files_changed: Joi.number().default(0),
  loc_changed: Joi.number().default(0)
});

predictionRouter.post('/predict', requireAuth, requireRole('Admin', 'DevOps Engineer'), async (req, res, next) => {
  try {
    const { error, value } = predictSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.message });
    }

    const result = await requestPrediction(value);

    await Prediction.create({
      deploymentId: value.deployment_id,
      service: value.service,
      features: {
        memoryChange: value.memory_change,
        cpuChange: value.cpu_change,
        commits: value.commits,
        helmChanges: value.helm_changes,
        nodeUsage: value.node_usage,
        podRestart: value.pod_restart,
        latency: value.latency,
        previousFailures: value.previous_failures,
        incidents: value.incidents,
        filesChanged: value.files_changed,
        locChanged: value.loc_changed
      },
      failureProbability: result.failureProbability,
      riskLevel: result.riskLevel,
      reasons: result.reasons
    });

    return res.json(result);
  } catch (err) {
    return next(err);
  }
});

const recommendSchema = Joi.object({
  deployment_id: Joi.string().required(),
  service: Joi.string().required(),
  riskLevel: Joi.string().valid('LOW', 'MEDIUM', 'HIGH', 'CRITICAL').required(),
  reasons: Joi.array().items(Joi.string()).default([])
});

predictionRouter.post('/recommend', requireAuth, requireRole('Admin', 'DevOps Engineer'), async (req, res, next) => {
  try {
    const { error, value } = recommendSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.message });
    }

    let result;
    try {
      result = await requestRecommendation(value);
    } catch (externalError) {
      result = {
        recommendations: generateRuleBasedRecommendations({
          riskLevel: value.riskLevel,
          reasons: value.reasons
        })
      };
    }

    await Recommendation.create({
      deploymentId: value.deployment_id,
      recommendations: result.recommendations || []
    });

    return res.json(result);
  } catch (err) {
    return next(err);
  }
});

predictionRouter.get('/predictions', requireAuth, async (req, res, next) => {
  try {
    const predictions = await Prediction.find().sort({ createdAt: -1 }).limit(200);
    return res.json(predictions);
  } catch (err) {
    return next(err);
  }
});

module.exports = { predictionRouter };
