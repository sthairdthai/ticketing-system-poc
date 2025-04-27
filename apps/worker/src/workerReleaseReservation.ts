import { Worker, Job } from 'bullmq';
import { TICKET_RESERVATION_QUEUE } from '../../../packages/mq/queue';  
// import { releaseTicket } from '../../../api-server//src//ticketService';
import { redisConfig } from '../../../packages/mq/connection';
import axios from 'axios'; // Importing axios to make API calls

const API_BASE_URL = 'http://localhost:3000/api/ticket'; // Adjust the URL if necessary

const worker = new Worker(TICKET_RESERVATION_QUEUE, async (job: Job) => {
    const { userId, ticketId } = job.data;
    console.log(`Processing reservation for Ticket ${ticketId} by User ${userId}`);
    // Business logic for reservation expiration or completion
     // Make an HTTP request to release the ticket via the /release endpoint
     try {
        const releaseResponse = await axios.post(`${API_BASE_URL}/release`, {
          userId, // Optional parameter
          ticketId,
        });
        if (releaseResponse.data.success) {
          console.log(`Ticket ${ticketId} successfully released for User ${userId}`);
        } else {
          console.error(`Failed to release Ticket ${ticketId} for User ${userId}`);
        }
      } catch (error) {
        if (error instanceof Error) {
          console.error(`Error releasing Ticket ${ticketId} for User ${userId}:`, error.message);
        } else {
          console.error(`Error releasing Ticket ${ticketId} for User ${userId}:`, error);
        }
      }
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