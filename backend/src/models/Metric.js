const mongoose = require('mongoose');

const MetricSchema = new mongoose.Schema(
  {
    service: {
      type: String,
      enum: ['payment-service', 'cart-service', 'inventory-service', 'order-service'],
      required: true
    },
    cpu: Number,
    memory: Number,
    podRestarts: Number,
    nodeUtilization: Number,
    responseTime: Number,
    source: { type: String, default: 'prometheus' },
    observedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

MetricSchema.index({ service: 1, observedAt: -1 });

module.exports = mongoose.model('Metric', MetricSchema);
