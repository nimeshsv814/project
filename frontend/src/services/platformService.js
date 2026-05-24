import api from './api';

export async function login(payload) {
  const { data } = await api.post('/login', payload);
  return data;
}

export async function getDeployments() {
  const { data } = await api.get('/deployments');
  return data;
}

export async function getMetrics(service) {
  const { data } = await api.get('/metrics', {
    params: service ? { service } : {}
  });
  return data;
}

export async function getPredictions() {
  const { data } = await api.get('/predictions');
  return data;
}

export async function getIncidents() {
  const { data } = await api.get('/incidents');
  return data;
}

export async function deploymentCheck(deploymentId) {
  const { data } = await api.post('/deployment/check', { deploymentId });
  return data;
}

export async function recommend(payload) {
  const { data } = await api.post('/recommend', payload);
  return data;
}
