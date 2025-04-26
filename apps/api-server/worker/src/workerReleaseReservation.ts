import { Worker, Job } from 'bullmq';
import { TICKET_RESERVATION_QUEUE } from '../../../../packages/mq/queue';  
import { releaseTicket } from '../../../api-server//src//ticketService';
import { redisConfig } from '../../../../packages/mq/connection';

const worker = new Worker(TICKET_RESERVATION_QUEUE, async (job: Job) => {
    const { userId, ticketId } = job.data;
    console.log(`Processing reservation for Ticket ${ticketId} by User ${userId}`);
    // Business logic for reservation expiration or completion
    await releaseTicket(userId, ticketId);
    console.log(`Ticket ${ticketId} released for User ${userId}`);
}, { connection: redisConfig });

worker.on('completed', (job) => {
    console.log(`Job completed: ${job.id} for Ticket ${job.data.ticketId}`);
});

worker.on('failed', (job, failedReason) => {
    console.error(`Job failed: ${job?.id ?? 'unknown'} due to ${failedReason}`);
});

worker.on('ready', () => console.log('✅ Worker connected and ready'));
worker.on('error', (err) => console.error('❌ Worker error:', err));

console.log(`✅ Worker is now listening for jobs on the ${TICKET_RESERVATION_QUEUE}...`);