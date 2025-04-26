import { Queue, Worker } from 'bullmq';
import { redisConfig } from './connection';

// Define queue names
const TICKET_QUEUE = 'ticketQueue';
const TICKET_BOUGHT_QUEUE = 'ticketBoughtQueue';

// Create queue instances
const ticketQueue = new Queue(TICKET_QUEUE, { connection: redisConfig });
const ticketBoughtQueue = new Queue(TICKET_BOUGHT_QUEUE, { connection: redisConfig });

export const publishTicketPurchase = async (ticketData: { ticketId: string, userId: string }) => {
  try {
    await ticketQueue.add('buy-ticket', ticketData);
    console.log(`Ticket purchase job published: ${JSON.stringify(ticketData)}`);
  } catch (error) {
    console.error('Error publishing ticket purchase job:', error);
  }
};

export const consumeTicketQueue = (handler: (data: { ticketId: string, userId: string }) => void) => {
  const worker = new Worker(TICKET_QUEUE, async (job) => {
    const { ticketId, userId } = job.data;
    handler({ ticketId, userId });
    console.log(`Processed buy-ticket job: Ticket ${ticketId} for User ${userId}`);
  }, { connection: redisConfig });

  worker.on('completed', (job) => {
    console.log(`ticketQueue job ${job.id} completed successfully`);
  });

  worker.on('failed', (job, failedReason) => {
    console.error(`ticketQueue job ${job?.id} failed due to: ${failedReason}`);
  });
};
