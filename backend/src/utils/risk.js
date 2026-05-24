function deriveRiskLevel(probability) {
  if (probability > 90) return 'CRITICAL';
  if (probability > 80) return 'HIGH';
  if (probability >= 50) return 'MEDIUM';
  return 'LOW';
}

function gateDecision(probability) {
  if (probability > 80) return 'pause';
  if (probability >= 50) return 'approval_required';
  return 'deploy';
}

module.exports = { deriveRiskLevel, gateDecision };
