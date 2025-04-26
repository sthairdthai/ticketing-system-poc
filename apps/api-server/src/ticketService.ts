// Simulating 10 available tickets
let availableTickets = 10;

export async function buyTicket(userId: string) {
  if (availableTickets > 0) {
    availableTickets--;
    console.log(`User ${userId} bought a ticket. Remaining tickets: ${availableTickets}`);
    return { success: true };
  } else {
    console.log(`User ${userId} tried to buy a ticket, but none are available.`);
    return { success: false, error: 'No tickets available.' };
  }
}
