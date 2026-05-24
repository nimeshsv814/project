const express = require('express');
const Joi = require('joi');

const Incident = require('../models/Incident');
const { requireAuth } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');
const { requestIncidentSummary } = require('../services/ml.service');

const incidentRouter = express.Router();

incidentRouter.get('/incidents', requireAuth, async (req, res, next) => {
  try {
    const incidents = await Incident.find().sort({ happenedAt: -1 }).limit(200);
    return res.json(incidents);
  } catch (err) {
    return next(err);
  }
});

const incidentSchema = Joi.object({
  deploymentId: Joi.string().required(),
  service: Joi.string().required(),
  severity: Joi.string().valid('LOW', 'MEDIUM', 'HIGH', 'CRITICAL').default('HIGH'),
  rootCause: Joi.string().required(),
  remediationActions: Joi.array().items(Joi.string()).default([])
});

incidentRouter.post('/incidents', requireAuth, requireRole('Admin', 'DevOps Engineer'), async (req, res, next) => {
  try {
    const { error, value } = incidentSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.message });
    }

    let summary;
    try {
      const summaryResult = await requestIncidentSummary(value);
      summary = summaryResult.summary;
    } catch (externalError) {
      summary = `${value.service} failed due to ${value.rootCause}. Remediation started.`;
    }

    const incident = await Incident.create({
      ...value,
      summary,
      status: 'open'
    });

    return res.status(201).json(incident);
  } catch (err) {
    return next(err);
  }
});

module.exports = { incidentRouter };
