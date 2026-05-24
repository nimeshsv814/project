const mongoose = require('mongoose');

const IncidentSchema = new mongoose.Schema(
  {
    deploymentId: { type: String, required: true, index: true },
    service: { type: String, required: true },
    severity: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'], default: 'HIGH' },
    rootCause: String,
    summary: String,
    status: { type: String, enum: ['open', 'resolved'], default: 'open' },
    remediationActions: [String],
    happenedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Incident', IncidentSchema);
