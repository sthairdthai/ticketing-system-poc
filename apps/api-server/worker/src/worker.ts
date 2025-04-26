import { Worker, Job } from 'bullmq';
import { redisConfig } from '../../../../packages/mq/connection';

const worker = new Worker('ticketQueue', async (job: Job) => {
  try {
    const { ticketId, userId } = job.data;
    console.log(`Processing ticket purchase: ${ticketId} for user ${userId}`);
    // Business logic for completing the purchase can go here
  } catch (error) {
    console.error(`Error processing job ${job.id}:`, error);
    throw error;
  }
}, { connection: redisConfig });

worker.on('completed', (job) => {
  console.log(`Job completed: ${job.id}`);
});

worker.on('failed', (job, failedReason) => {
  console.error(`Job failed: ${job?.id ?? 'unknown'} due to ${failedReason}`);
});

worker.on('ready', () => console.log('✅ Worker connected and ready'));
worker.on('error', (err) => console.error('❌ Worker error:', err));

console.log('✅ Worker is now listening for jobs on the "ticketQueue"...');
