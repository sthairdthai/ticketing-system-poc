import { ticketQueue } from '../../../packages/mq/connection';

let availableTickets = 100; // Starting with 100 tickets

export const reserveTicket = async (userId: string) => {
  if (availableTickets > 0) {
    availableTickets--;
    console.log(`User ${userId} reserved a ticket. Remaining tickets: ${availableTickets}`);
    setTimeout(() => releaseTicket(userId), 5 * 60 * 1000); // Release after 5 minutes
    return { success: true };
  } else {
    console.log(`User ${userId} tried to reserve a ticket, but none are available.`);
    return { success: false, error: 'No tickets available.' };
  }
};

export const releaseTicket = (userId: string) => {
  availableTickets++;
  console.log(`Ticket reservation expired for User ${userId}. Ticket released. Available tickets: ${availableTickets}`);
};

export const buyTicket = async (ticketData: any) => {
  await ticketQueue.add('buy-ticket', ticketData);
};
