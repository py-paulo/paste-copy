import * as dotenv from 'dotenv';

dotenv.config();

const config: {
  port: number,
  redis: {
    url: string;
  }
  mongodb: {
    url: string;
  }
  rabbitMQ: {
    url: string;
  }
} = {
  port: process.env.PORT ? parseInt(process.env.PORT, 10) : 8000,
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
  },
  mongodb: {
    url: process.env.MONGODB_URL || 'mongodb://root:mongo@localhost:27017',
  },
  rabbitMQ: {
    url: process.env.RABBITMQ_URL || 'amqp://localhost',
  }
}

export default config;