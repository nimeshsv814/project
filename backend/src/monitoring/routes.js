const express = require('express');
const Metric = require('../models/Metric');
const { requireAuth } = require('../middleware/auth');
const { fetchPrometheusInstant } = require('../services/prometheus.service');

const monitoringRouter = express.Router();

monitoringRouter.get('/metrics', requireAuth, async (req, res, next) => {
  try {
    const service = req.query.service;
    const filter = service ? { service } : {};
    const metrics = await Metric.find(filter).sort({ observedAt: -1 }).limit(200);
    return res.json(metrics);
  } catch (err) {
    return next(err);
  }
});

monitoringRouter.post('/metrics/pull', requireAuth, async (req, res, next) => {
  try {
    // Example query for CPU usage. Expand per your Prometheus setup.
    const result = await fetchPrometheusInstant('sum(rate(container_cpu_usage_seconds_total[5m]))');
    return res.json({
      source: 'prometheus',
      result
    });
  } catch (err) {
    return next(err);
  }
});

monitoringRouter.post('/metrics', requireAuth, async (req, res, next) => {
  try {
    const metric = await Metric.create(req.body);
    return res.status(201).json(metric);
  } catch (err) {
    return next(err);
  }
});

module.exports = { monitoringRouter };
