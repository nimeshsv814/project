const { connectDB } = require('../config/db');
const Deployment = require('../models/Deployment');
const Metric = require('../models/Metric');
const Prediction = require('../models/Prediction');
const Recommendation = require('../models/Recommendation');
const Incident = require('../models/Incident');

const SERVICES = ['payment-service', 'cart-service', 'inventory-service', 'order-service'];

function random(min, max) {
  return Math.random() * (max - min) + min;
}

function randomInt(min, max) {
  return Math.floor(random(min, max + 1));
}

function riskLevel(score) {
  if (score > 90) return 'CRITICAL';
  if (score > 80) return 'HIGH';
  if (score >= 50) return 'MEDIUM';
  return 'LOW';
}

async function seed() {
  await connectDB();

  await Promise.all([
    Deployment.deleteMany({}),
    Metric.deleteMany({}),
    Prediction.deleteMany({}),
    Recommendation.deleteMany({}),
    Incident.deleteMany({})
  ]);

  const deployments = [];

  for (let i = 0; i < 25; i += 1) {
    const service = SERVICES[i % SERVICES.length];
    const score = randomInt(20, 95);

    deployments.push({
      deploymentId: `deploy-${String(i + 1).padStart(3, '0')}`,
      name: `${service}-release-${i + 1}`,
      service,
      status: score > 80 ? 'Warning' : 'Success',
      git: {
        commitCount: randomInt(1, 20),
        filesChanged: randomInt(5, 80),
        locChanged: randomInt(100, 2400),
        branch: 'main',
        commitSha: Math.random().toString(16).slice(2, 10)
      },
      kubernetes: {
        deploymentYamlHash: Math.random().toString(16).slice(2),
        valuesYamlHash: Math.random().toString(16).slice(2),
        helmChanges: randomInt(0, 8),
        cpuRequest: 0.4,
        cpuLimit: 1,
        memoryRequest: 256,
        memoryLimit: 768
      },
      history: {
        previousFailures: randomInt(0, 4),
        incidents: randomInt(0, 3)
      },
      monitoring: {
        nodeUtilization: randomInt(45, 95),
        latency: randomInt(120, 520),
        cpu: randomInt(20, 95),
        memory: randomInt(20, 95),
        podRestarts: randomInt(0, 5),
        responseTime: randomInt(80, 400)
      },
      lastRiskScore: score,
      lastRiskLevel: riskLevel(score)
    });
  }

  const createdDeployments = await Deployment.insertMany(deployments);

  const metrics = [];
  createdDeployments.forEach((deployment) => {
    for (let i = 0; i < 6; i += 1) {
      metrics.push({
        service: deployment.service,
        cpu: randomInt(20, 95),
        memory: randomInt(20, 95),
        podRestarts: randomInt(0, 5),
        nodeUtilization: randomInt(35, 95),
        responseTime: randomInt(100, 420),
        observedAt: new Date(Date.now() - i * 60 * 1000)
      });
    }
  });

  await Metric.insertMany(metrics);

  const predictions = createdDeployments.map((deployment) => ({
    deploymentId: deployment.deploymentId,
    service: deployment.service,
    features: {
      memoryChange: randomInt(50, 700),
      cpuChange: random(0.1, 1.6),
      commits: randomInt(1, 20),
      helmChanges: randomInt(0, 8),
      nodeUsage: deployment.monitoring.nodeUtilization,
      podRestart: deployment.monitoring.podRestarts,
      latency: deployment.monitoring.latency,
      previousFailures: deployment.history.previousFailures,
      incidents: deployment.history.incidents,
      filesChanged: deployment.git.filesChanged,
      locChanged: deployment.git.locChanged
    },
    failureProbability: deployment.lastRiskScore,
    riskLevel: deployment.lastRiskLevel,
    reasons:
      deployment.lastRiskScore > 80
        ? ['node utilization high', 'memory increased']
        : ['baseline stable']
  }));

  await Prediction.insertMany(predictions);

  const recommendations = predictions.slice(0, 8).map((prediction) => ({
    deploymentId: prediction.deploymentId,
    recommendations:
      prediction.riskLevel === 'LOW'
        ? ['Proceed with standard rollout']
        : ['Increase memory limit', 'Enable canary deployment', 'Add one node']
  }));

  await Recommendation.insertMany(recommendations);

  const incidents = predictions
    .filter((prediction) => ['HIGH', 'CRITICAL'].includes(prediction.riskLevel))
    .slice(0, 5)
    .map((prediction) => ({
      deploymentId: prediction.deploymentId,
      service: prediction.service,
      severity: prediction.riskLevel,
      rootCause: 'memory exhaustion',
      summary: `${prediction.service} failed due to memory exhaustion. Rollback completed successfully.`,
      status: 'resolved',
      remediationActions: ['rollback deployment', 'restart pods']
    }));

  if (incidents.length) {
    await Incident.insertMany(incidents);
  }

  console.log('Sample platform data seeded');
  process.exit(0);
}

seed().catch((error) => {
  console.error('Failed to seed sample data', error);
  process.exit(1);
});
