const mongoose = require('mongoose');

const DeploymentSchema = new mongoose.Schema(
  {
    deploymentId: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    service: {
      type: String,
      enum: ['payment-service', 'cart-service', 'inventory-service', 'order-service'],
      required: true
    },
    status: { type: String, enum: ['Success', 'Warning', 'Failed'], default: 'Warning' },
    git: {
      commitCount: Number,
      filesChanged: Number,
      locChanged: Number,
      branch: String,
      commitSha: String
    },
    kubernetes: {
      deploymentYamlHash: String,
      valuesYamlHash: String,
      helmChanges: Number,
      cpuRequest: Number,
      cpuLimit: Number,
      memoryRequest: Number,
      memoryLimit: Number
    },
    history: {
      previousFailures: { type: Number, default: 0 },
      incidents: { type: Number, default: 0 }
    },
    monitoring: {
      nodeUtilization: Number,
      latency: Number,
      cpu: Number,
      memory: Number,
      podRestarts: Number,
      responseTime: Number
    },
    lastRiskScore: { type: Number, default: 0 },
    lastRiskLevel: { type: String, default: 'LOW' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Deployment', DeploymentSchema);
