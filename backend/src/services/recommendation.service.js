function generateRuleBasedRecommendations(prediction) {
  const recommendations = [];

  if ((prediction.reasons || []).some((r) => r.toLowerCase().includes('memory'))) {
    recommendations.push('Increase memory limit', 'Add one AKS node in the target node pool');
  }

  if ((prediction.reasons || []).some((r) => r.toLowerCase().includes('cpu'))) {
    recommendations.push('Tune HPA target CPU threshold to absorb spikes');
  }

  if ((prediction.reasons || []).some((r) => r.toLowerCase().includes('helm'))) {
    recommendations.push('Fix Helm values and validate with helm template in CI');
  }

  if ((prediction.riskLevel || '').toUpperCase() === 'HIGH' || (prediction.riskLevel || '').toUpperCase() === 'CRITICAL') {
    recommendations.push('Enable canary deployment for staged rollout');
  }

  return [...new Set(recommendations)].slice(0, 5);
}

module.exports = { generateRuleBasedRecommendations };
