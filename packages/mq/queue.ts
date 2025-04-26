import { Queue, Worker } from 'bullmq';
import { redisConfig } from './connection';

// Define queue names
export const TICKET_QUEUE = 'ticketQueue';
// export const TICKET_BOUGHT_QUEUE = 'ticketBoughtQueue';
export const TICKET_RESERVATION_QUEUE = 'ticketReservationQueue';
export const RELEASE_TICKET_AFTER_1S = 1

// Create queue instances
const ticketQueue = new Queue(TICKET_QUEUE, { connection: redisConfig });
// const ticketBoughtQueue = new Queue(TICKET_BOUGHT_QUEUE, { connection: redisConfig });
const ticketReservationQueue = new Queue(TICKET_RESERVATION_QUEUE, { connection: redisConfig });

// Publish ticket purchase job to the queue
export const publishTicketPurchase = async (ticketData: { ticketId: number, userId: string }) => {
  try {
    console.log(`Publishing ticket purchase job for Ticket ${ticketData.ticketId} by User ${ticketData.userId}`);
    await ticketQueue.add('buy-ticket', ticketData);
    console.log(`Ticket purchase job for Ticket ${ticketData.ticketId} added to the queue.`);
  } catch (error) {
    console.error('Error publishing ticket purchase job:', error);
  }
};

export const addTicketReservationQueue = async (ticketData: { ticketId: number, userId: string }) => {
  try {
    console.log(`Publishing ticket purchase job for Ticket ${ticketData.ticketId} by User ${ticketData.userId}`);
    await ticketReservationQueue.add('release-ticket', { ticketId: ticketData.ticketId, userId: ticketData.userId }, { delay: RELEASE_TICKET_AFTER_1S * 60 * 1000 }); // Delay of 1 minute (in ms)
    console.log(`Ticket purchase job for Ticket ${ticketData.ticketId} added to the queue.`);
  } catch (error) {
    console.error('Error publishing ticket purchase job:', error);
  }
}



// Consume jobs from the ticketQueue and process them
// export const consumeTicketQueue = (handler: (data: { ticketId: number, userId: string }) => void) => {
//   const worker = new Worker(TICKET_QUEUE, async (job) => {
//     const { ticketId, userId } = job.data;
//     console.log(`Processing Ticket ${ticketId} purchase for User ${userId}`);
//     handler({ ticketId, userId });
//     console.log(`Processed buy-ticket job for Ticket ${ticketId} by User ${userId}`);
//   }, { connection: redisConfig });

//   worker.on('completed', (job) => {
//     console.log(`ticketQueue job ${job.id} completed successfully for Ticket ${job.data.ticketId} by User ${job.data.userId}`);
//   });

//   worker.on('failed', (job, failedReason) => {
//     console.error(`ticketQueue job ${job?.id ?? 'unknown'} failed due to: ${failedReason}`);
//   });
// };
