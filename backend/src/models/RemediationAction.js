const mongoose = require('mongoose');

const RemediationActionSchema = new mongoose.Schema(
  {
    deploymentId: { type: String, required: true, index: true },
    action: { type: String, required: true },
    command: { type: String, required: true },
    status: { type: String, enum: ['success', 'failed'], required: true },
    output: String,
    executedBy: String
  },
  { timestamps: true }
);

module.exports = mongoose.model('RemediationAction', RemediationActionSchema);
