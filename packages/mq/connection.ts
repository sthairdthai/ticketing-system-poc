import { Queue, Worker } from 'bullmq'

// Define Redis connection configuration once
export const redisConfig = {
    host: 'localhost', // Your Redis host
    port: 6379,        // Your Redis port
}

// Create a queue with the Redis config
const ticketQueue = new Queue('ticketQueue', {
    connection: redisConfig,
})

// Set up the worker to process jobs from the queue
const worker = new Worker('ticketQueue', async job => {
    console.log(`Processing job ${job.id}:`, job.data)
    // Simulate the ticket-buying process or any other processing you need
    // You can access job data with job.data
}, {
    connection: redisConfig,
})

// Function to add a job to the queue
async function addJob() {
    //   await ticketQueue.add('buy-ticket', {
    //     ticketType: 'VIP',
    //     quantity: 2,
    //   })
    await ticketQueue.add('buy-ticket', {
        ticketType: 'VIP',
        quantity: 2,
    }, {
        delay: 10000,  // Delay the job for 10 seconds
    })
}

// Export the queue and worker so you can use them elsewhere
export { ticketQueue, worker, addJob }
