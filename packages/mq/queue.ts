import { Queue, Worker } from 'bullmq'
import { redisConfig } from './connection' // Import the shared Redis config

const TICKET_BOUGHT_QUEUE = 'ticket-bought'

// Publish the event (enqueue a job to the queue)
export const publishTicketBoughtEvent = async (data: { ticketId: string, userId: string }) => {
    try {
        // Create a new queue instance for ticket-bought events
        const queue = new Queue(TICKET_BOUGHT_QUEUE, {
            connection: redisConfig, // Reuse the shared Redis config
        })

        // Add a job to the queue
        await queue.add('ticket-bought', data)
        console.log(`Ticket bought event published: ${JSON.stringify(data)}`)
    } catch (error) {
        console.error('Error publishing ticket bought event:', error)
    }
}

// Consume the event (process the job using a worker)
export const consumeTicketBoughtEvent = (handler: (data: { ticketId: string, userId: string }) => void) => {
    try {
        // Create a new worker instance that listens for jobs in the ticket-bought queue
        const worker = new Worker(TICKET_BOUGHT_QUEUE, async (job) => {
            const { ticketId, userId } = job.data
            handler({ ticketId, userId })
            console.log(`Processed ticket bought event: ${ticketId} for user: ${userId}`)
        }, {
            connection: redisConfig, // Reuse the shared Redis config
        })

        worker.on('completed', (job) => {
            if (job) {
                console.log(`Job ${job.id} completed successfully`)
              }
        })

        worker.on('failed', (job, failedReason) => {
            if (job) {
                console.error(`Job ${job.id} failed due to: ${failedReason}`)
            } else {
                console.error('Job failed but job data was not available.')
            }
        })

    } catch (error) {
        console.error('Error consuming ticket bought event:', error)
    }
}
