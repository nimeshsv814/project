const amqp = require('amqplib');
const { ENV } = require('../config/env');

let channel;

async function connectQueue() {
  if (!ENV.RABBITMQ_URL) {
    console.log('RabbitMQ URL not configured. Message queue disabled.');
    return null;
  }

  try {
    const conn = await amqp.connect(ENV.RABBITMQ_URL);
    channel = await conn.createChannel();
    await channel.assertExchange('deployment.events', 'topic', { durable: true });
    console.log('RabbitMQ connected');
    return channel;
  } catch (error) {
    console.warn('RabbitMQ connection failed. Continuing without queue.', error.message);
    return null;
  }
}

async function publishEvent(routingKey, payload) {
  if (!channel) return;
  channel.publish('deployment.events', routingKey, Buffer.from(JSON.stringify(payload)), {
    persistent: true,
    contentType: 'application/json'
  });
}

module.exports = { connectQueue, publishEvent };
