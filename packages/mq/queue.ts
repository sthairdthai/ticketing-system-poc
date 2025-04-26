import { Queue, Worker } from 'bullmq';
import { redisConfig } from './connection';

// Define queue names
export const TICKET_QUEUE = 'ticketQueue';
export const TICKET_BOUGHT_QUEUE = 'ticketBoughtQueue';

// Create queue instances
const ticketQueue = new Queue(TICKET_QUEUE, { connection: redisConfig });
const ticketBoughtQueue = new Queue(TICKET_BOUGHT_QUEUE, { connection: redisConfig });

export const publishTicketPurchase = async (ticketData: { ticketId: string, userId: string }) => {
  try {
    console.log(`Publishing ticket purchase job for Ticket ${ticketData.ticketId} by User ${ticketData.userId}`);
    await ticketQueue.add('buy-ticket', ticketData);
    console.log(`Ticket purchase job for Ticket ${ticketData.ticketId} added to the queue.`);
  } catch (error) {
    console.error('Error publishing ticket purchase job:', error);
  }
};

export const consumeTicketQueue = (handler: (data: { ticketId: string, userId: string }) => void) => {
  const worker = new Worker(TICKET_QUEUE, async (job) => {
    const { ticketId, userId } = job.data;
    console.log(`Processing Ticket ${ticketId} purchase for User ${userId}`);
    handler({ ticketId, userId });
    console.log(`Processed buy-ticket job for Ticket ${ticketId} by User ${userId}`);
  }, { connection: redisConfig });

  worker.on('completed', (job) => {
    console.log(`ticketQueue job ${job.id} completed successfully for Ticket ${job.data.ticketId} by User ${job.data.userId}`);
  });

  worker.on('failed', (job, failedReason) => {
    console.error(`ticketQueue job ${job?.id ?? 'unknown'} failed due to: ${failedReason}`);
  });
};
