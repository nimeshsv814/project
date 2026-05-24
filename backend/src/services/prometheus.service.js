const axios = require('axios');
const { ENV } = require('../config/env');

async function fetchPrometheusInstant(query) {
  const response = await axios.get(`${ENV.PROMETHEUS_BASE_URL}/api/v1/query`, {
    params: { query }
  });
  return response.data;
}

module.exports = { fetchPrometheusInstant };
