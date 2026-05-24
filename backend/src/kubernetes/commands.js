const { exec } = require('node:child_process');
const { ENV } = require('../config/env');

function runKubectl(args) {
  return new Promise((resolve, reject) => {
    const command = `kubectl -n ${ENV.KUBECTL_NAMESPACE} ${args}`;
    exec(command, { timeout: 20000 }, (error, stdout, stderr) => {
      if (error) {
        return reject(new Error(stderr || error.message));
      }
      return resolve(stdout.trim());
    });
  });
}

async function rollbackDeployment(deploymentName) {
  return runKubectl(`rollout undo deployment/${deploymentName}`);
}

async function scaleDeployment(deploymentName, replicas) {
  return runKubectl(`scale deployment/${deploymentName} --replicas=${replicas}`);
}

async function restartPods(selector) {
  return runKubectl(`delete pod -l app=${selector}`);
}

async function scaleNodePoolRecommendation(nodePoolName, count) {
  return `Recommended scaling node pool ${nodePoolName} to ${count}. Execute via az aks nodepool scale.`;
}

module.exports = {
  rollbackDeployment,
  scaleDeployment,
  restartPods,
  scaleNodePoolRecommendation
};
