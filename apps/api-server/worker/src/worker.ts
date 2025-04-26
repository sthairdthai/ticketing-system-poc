import { Worker, Job } from 'bullmq'
import { redisConfig } from '../../../../packages/mq/connection' // Import the shared Redis config
import { createClient } from 'redis'

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// Define the worker that processes the jobs from the queue
const worker = new Worker('ticketQueue', async (job: Job) => {
    try {
        console.log(`Processing job ${job.id}:`, job.data)

        // Simulate ticket-buying process or any other job processing logic
        if (job.name === 'buy-ticket') {
            const { ticketType, quantity } = job.data
            // 👇 Simulate 1 second per event
            await sleep(1000)

            console.log(`Buying ${quantity} ${ticketType} tickets`)
            // Add your business logic here
        }
    } catch (error) {
        console.error(`Error processing job ${job.id}:`, error)
        // Optionally, you can throw the error to retry the job
        throw error
    }
}, {
    connection: redisConfig, // Reuse the shared Redis config
})

worker.on('completed', (job) => {
    console.log(`Job completed: ${job.id}`)
    // You can update job status in a database or trigger notifications
})

worker.on('failed', (job, failedReason) => {
    console.error(`Job failed: ${job?.id ?? 'unknown'} due to ${failedReason}`)
    // You can log the failure or retry the job manually
})

worker.on('ready', () => console.log('✅ Worker connected and ready'))
worker.on('error', (err) => console.error('❌ Worker error:', err))

console.log('✅ Worker is now listening for jobs on the "ticketQueue"...')
// Optional: You can listen to other events, such as waiting, active, stalled, etc.
// worker.on('waiting', (jobId) => console.log(`Job ${jobId} is waiting`))

// Export worker for usage elsewhere if needed
export { worker }
