// queue.ts
import { Queue, Worker } from 'bullmq'
import { redisConfig } from './connection'

// Define queue names
const TICKET_QUEUE = 'ticketQueue'
const TICKET_BOUGHT_QUEUE = 'ticketBoughtQueue'

// Create queue instances ONCE (important for efficiency)
const ticketQueue = new Queue(TICKET_QUEUE, {
  connection: redisConfig,
})

const ticketBoughtQueue = new Queue(TICKET_BOUGHT_QUEUE, {
  connection: redisConfig,
})

/**
 * Publish a job to ticketQueue (user is buying a ticket)
 */
export const publishTicketPurchase = async (data: { ticketType: string, quantity: number }) => {
  try {
    await ticketQueue.add('buy-ticket', data)
    console.log(`Ticket purchase job published: ${JSON.stringify(data)}`)
  } catch (error) {
    console.error('Error publishing ticket purchase job:', error)
  }
}

/**
 * Publish a job to ticketBoughtQueue (after the ticket is successfully bought)
 */
export const publishTicketBoughtEvent = async (data: { ticketId: string, userId: string }) => {
  try {
    await ticketBoughtQueue.add('ticket-bought', data)
    console.log(`Ticket bought event published: ${JSON.stringify(data)}`)
  } catch (error) {
    console.error('Error publishing ticket bought event:', error)
  }
}

/**
 * Consume jobs from ticketQueue (user buying ticket)
 */
export const consumeTicketQueue = (handler: (data: { ticketType: string, quantity: number }) => void) => {
  try {
    const worker = new Worker(TICKET_QUEUE, async (job) => {
      const { ticketType, quantity } = job.data
      handler({ ticketType, quantity })
      console.log(`Processed buy-ticket job: ${quantity} x ${ticketType}`)
    }, {
      connection: redisConfig,
    })

    worker.on('completed', (job) => {
      console.log(`ticketQueue job ${job.id} completed successfully`)
    })

    worker.on('failed', (job, failedReason) => {
      console.error(`ticketQueue job ${job?.id} failed due to: ${failedReason}`)
    })

  } catch (error) {
    console.error('Error consuming ticket queue:', error)
  }
}

/**
 * Consume jobs from ticketBoughtQueue (after ticket is bought)
 */
export const consumeTicketBoughtQueue = (handler: (data: { ticketId: string, userId: string }) => void) => {
  try {
    const worker = new Worker(TICKET_BOUGHT_QUEUE, async (job) => {
      const { ticketId, userId } = job.data
      handler({ ticketId, userId })
      console.log(`Processed ticket-bought event: Ticket ${ticketId} for User ${userId}`)
    }, {
      connection: redisConfig,
    })

    worker.on('completed', (job) => {
      console.log(`ticketBoughtQueue job ${job.id} completed successfully`)
    })

    worker.on('failed', (job, failedReason) => {
      console.error(`ticketBoughtQueue job ${job?.id} failed due to: ${failedReason}`)
    })

  } catch (error) {
    console.error('Error consuming ticket bought queue:', error)
  }
}
