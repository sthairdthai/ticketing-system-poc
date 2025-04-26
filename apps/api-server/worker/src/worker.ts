import { Worker, Job } from 'bullmq';
import { redisConfig } from '../../../../packages/mq/connection';
import { TICKET_QUEUE } from '../../../../packages/mq/queue';  // Adjust the path to queue.ts if needed

const worker = new Worker(TICKET_QUEUE, async (job: Job) => {
    const { ticketId, userId } = job.data;
    try {
        console.log(`Worker is processing the purchase for Ticket ${ticketId} by User ${userId}`);
        // Simulate purchase processing logic
        console.log(`Successfully processed purchase for Ticket ${ticketId} by User ${userId}`);
    } catch (error) {
        console.error(`Error processing job ${job.id} for Ticket ${ticketId} by User ${userId}:`, error);
        throw error;
    }
}, { connection: redisConfig });

worker.on('completed', (job) => {
    console.log(`Job completed: Ticket ${job.data.ticketId} for User ${job.data.userId}`);
});

worker.on('failed', (job, failedReason) => {
    console.error(`Job failed: Ticket ${job?.data?.ticketId ?? 'unknown'} for User ${job?.data?.userId ?? 'unknown'} due to ${failedReason}`);
});

worker.on('ready', () => console.log('✅ Worker connected and ready'));
worker.on('error', (err) => console.error('❌ Worker error:', err));

console.log(`✅ Worker is now listening for jobs on the ${TICKET_QUEUE}...`);
