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
export const ticketReservationQueue = new Queue(TICKET_RESERVATION_QUEUE, { connection: redisConfig });

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
    console.log(`Publishing ticket reservation job for Ticket ${ticketData.ticketId} by User ${ticketData.userId}`);

    const job = await ticketReservationQueue.add('release-ticket',
      { ticketId: ticketData.ticketId, userId: ticketData.userId },
      {
        removeOnComplete: true,
        removeOnFail: true,
        // jobId: ticketData.ticketId,
        attempts: 1,
        delay: RELEASE_TICKET_AFTER_1S * 60 * 1000
      } // Delay of 1 minute
    );

    console.log(`Ticket reservation job added. Job ID: ${job.id}`);

    return job; // <<< Return the job object!
  } catch (error) {
    console.error('Error publishing ticket reservation job:', error);
    throw error;
  }
};


// export const async function validateAndBuyTicket(ticketId: string, userId: string) {
//   const job = await reservationQueue.getJob(ticketId)

//   if (!job) {
//     throw new Error('No reservation found or reservation expired')
//   }

//   if (job.data.userId !== userId) {
//     throw new Error('Reservation belongs to a different user')
//   }

//   // Valid reservation, proceed to buy
//   await finalizePurchase(ticketId, userId)

//   // Optionally, remove reservation job manually if needed
//   await job.remove()
// }