import { Queue } from 'bullmq';

export const redisConfig = {
  host: 'localhost', // Redis host
  port: 6379,        // Redis port
};

// export const ticketQueue = new Queue('ticketQueue', {
//   connection: redisConfig,
// });
