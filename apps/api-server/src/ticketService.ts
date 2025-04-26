import { ticketQueue } from '../../../packages/mq/connection'
import { createClient } from 'redis'

const redisClient = createClient({ socket: { host: 'localhost', port: 6379 } })

  ; (async () => {
    await redisClient.connect()
  })()

export const tickets = Array.from({ length: 100 }, (_, index) => ({
  id: `ticket-${index + 1}`,
  status: 'available', // or 'reserved', 'sold', ...
  createdAt: new Date(),
  updatedAt: new Date()
}))

export function getAvailableTickets() {
  return tickets.filter(ticket => ticket.status === 'available')
}

export function reserveTicket(ticketId: string) {
  const ticket = tickets.find(t => t.id === ticketId)
  if (ticket && ticket.status === 'available') {
    ticket.status = 'reserved'
    ticket.updatedAt = new Date()
    return ticket
  }
  return null
}

const LOCK_EXPIRATION_SECONDS = 300 // 5 minutes

export const lockTicket = async (ticketId: string) => {
  const lockKey = `lock:ticket:${ticketId}`
  const result = await redisClient.set(lockKey, 'locked', {
    EX: LOCK_EXPIRATION_SECONDS, // Expire automatically in 5 minutes
    NX: true, // Only set if it does not exist
  })
  return result === 'OK'
}

export const unlockTicket = async (ticketId: string) => {
  const lockKey = `lock:ticket:${ticketId}`
  await redisClient.del(lockKey)
}

export const isTicketLocked = async (ticketId: string) => {
  const lockKey = `lock:ticket:${ticketId}`
  const value = await redisClient.get(lockKey)
  return value !== null
}

// existing buyTicket function
export const buyTicket = async (ticketId: any) => {
  // await ticketQueue.add('buy-ticket', ticketData)
  const ticket = tickets.find(t => t.id === ticketId);

  if (ticket && ticket.status === 'available') {
    // Mark as reserved for 5 mins
    ticket.status = 'reserved';
    ticket.updatedAt = new Date();
    console.log(`Ticket ${ticketId} is now reserved for 5 minutes.`);

    // Add the job to the queue for processing
    await ticketQueue.add('buy-ticket', { ticketId });

    
    console.log(`Ticket ${ticketId} is now reserved for 5 minutes.`);
    // // Simulate a delay of 5 minutes to complete the ticket purchase
    // setTimeout(() => {
    //   ticket.status = 'sold';  // After 5 minutes, mark it as sold
    //   ticket.updatedAt = new Date();
    //   console.log(`Ticket ${ticketId} is now sold.`);
    // }, 5 * 60 * 1000); // 5 minutes
    return true;
  } else {
    console.log(`Ticket ${ticketId} is already reserved or sold.`);
    return false;
  }
}
