const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const { authRouter } = require('./auth/routes');
const { deploymentRouter } = require('./deployment/routes');
const { monitoringRouter } = require('./monitoring/routes');
const { predictionRouter } = require('./prediction/routes');
const { remediationRouter } = require('./remediation/routes');
const { incidentRouter } = require('./incidents/routes');
const { errorHandler } = require('./middleware/errorHandler');

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(morgan('combined'));

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'backend' });
});

app.use('/api', authRouter);
app.use('/api', deploymentRouter);
app.use('/api', monitoringRouter);
app.use('/api', predictionRouter);
app.use('/api', remediationRouter);
app.use('/api', incidentRouter);

app.use(errorHandler);

module.exports = { app };
