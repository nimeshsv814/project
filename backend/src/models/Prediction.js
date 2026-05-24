const mongoose = require('mongoose');

const PredictionSchema = new mongoose.Schema(
  {
    deploymentId: { type: String, index: true, required: true },
    service: String,
    features: {
      memoryChange: Number,
      cpuChange: Number,
      commits: Number,
      helmChanges: Number,
      nodeUsage: Number,
      podRestart: Number,
      latency: Number,
      previousFailures: Number,
      incidents: Number,
      filesChanged: Number,
      locChanged: Number
    },
    failureProbability: { type: Number, required: true },
    riskLevel: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
      required: true
    },
    reasons: [String]
  },
  { timestamps: true }
);

module.exports = mongoose.model('Prediction', PredictionSchema);
