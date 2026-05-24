const axios = require('axios');
const { ENV } = require('../config/env');

async function requestPrediction(payload) {
  const response = await axios.post(`${ENV.ML_SERVICE_BASE_URL}/predict`, payload);
  return response.data;
}

async function requestRecommendation(payload) {
  const response = await axios.post(`${ENV.ML_SERVICE_BASE_URL}/recommend`, payload);
  return response.data;
}

async function requestIncidentSummary(payload) {
  const response = await axios.post(`${ENV.ML_SERVICE_BASE_URL}/summarize-incident`, payload);
  return response.data;
}

module.exports = {
  requestPrediction,
  requestRecommendation,
  requestIncidentSummary
};
