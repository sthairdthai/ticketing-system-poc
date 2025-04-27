import { publishTicketPurchase, addTicketReservationQueue, RELEASE_TICKET_AFTER_1S , ticketReservationQueue} from '../../../packages/mq/queue'

let availableTickets: number[] = Array.from({ length: 100 }, (_, index) => index + 1); // Ticket IDs 1-100
// In-memory map of ticketId -> reservation jobId
const reservationJobs = new Map<number, string>();

// Function to get the list of available tickets
export const getAvailableTickets = () => {
  return availableTickets;
};

// Function to reserve a specific ticket for a user
export const reserveTicket = async (userId: string, ticketId: number) => {

  const ticketIndex = availableTickets.indexOf(ticketId); // Find the index of the specific ticket
  if (ticketIndex !== -1) { // Check if the ticket exists in the available list
    removeTicket(ticketId); // Remove the ticket using the utility function
    console.log(`User ${userId} reserved Ticket ${ticketId}. Remaining tickets: ${availableTickets.length}`);

    // Add a job reservation queue
    const job = await addTicketReservationQueue({ userId, ticketId })
    if (job.id) {
        reservationJobs.set(ticketId, job.id); // Save job ID
    } else {
        console.error(`Failed to reserve ticket ${ticketId} for user ${userId}: job ID is undefined.`);
    }
    // setTimeout(() => releaseTicket(ticketId,userId), RELEASE_TICKET_AFTER_1S * 60 * 1000); // Release after 1 minutes

    return { success: true, ticketId };
  } else {
    console.log(`User ${userId} tried to reserve Ticket ${ticketId}, but it is no longer available.`);
    return { success: false, error: 'Ticket not available.' };
  }
};

export const releaseTicket = (ticketId: number, userId?: string) => {
  availableTickets.push(ticketId); // Add the ticket back to the available pool
  console.log(`Ticket reservation expired for User ${userId} (Ticket ${ticketId}). Ticket released. Available tickets: ${availableTickets.length}`);

  // Cleanup reservationJobs map
  reservationJobs.delete(ticketId);
};

// Function to buy a reserved ticket (publish to the queue)
export const buyTicket = async (ticketData: any) => {
  const { ticketId, userId } = ticketData;
  console.log(`User ${userId} is purchasing Ticket ${ticketId}...`);


  // Cancel the reservation job if it exists
  const jobId = reservationJobs.get(ticketId);
  if (jobId) {
    await ticketReservationQueue.remove(jobId);
    reservationJobs.delete(ticketId);
    console.log(`Reservation job for Ticket ${ticketId} canceled.`);
  }

  // Add the buy-ticket job to the queue
  await publishTicketPurchase({ ticketId, userId });

  // After successfully buying the ticket, remove it from the available tickets list
  removeTicket(ticketId);
  console.log(`Ticket ${ticketId} bought by User ${userId}. Remaining tickets: ${availableTickets.length}`);
};


// Utility function to remove a ticket from the available tickets list
const removeTicket = (ticketId: number) => {
  const ticketIndex = availableTickets.indexOf(ticketId);
  if (ticketIndex !== -1) {
    availableTickets.splice(ticketIndex, 1); // Remove the ticket from available tickets
    console.log(`Ticket ${ticketId} removed. Remaining tickets: ${availableTickets.length}`);
  } else {
    console.log(`Ticket ${ticketId} is already removed or not found.`);
  }
};