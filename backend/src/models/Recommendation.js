const mongoose = require('mongoose');

const RecommendationSchema = new mongoose.Schema(
  {
    deploymentId: { type: String, required: true, index: true },
    recommendations: [String],
    source: { type: String, default: 'ai-engine' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Recommendation', RecommendationSchema);
