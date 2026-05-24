const { ENV } = require('./config/env');
const { connectDB } = require('./config/db');
const { app } = require('./app');
const { connectQueue } = require('./services/messageQueue.service');

async function bootstrap() {
  try {
    await connectDB();
    await connectQueue();
    app.listen(ENV.PORT, () => {
      console.log(`Backend API running on port ${ENV.PORT}`);
    });
  } catch (error) {
    console.error('Failed to bootstrap backend', error);
    process.exit(1);
  }
}

bootstrap();
