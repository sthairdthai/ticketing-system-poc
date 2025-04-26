import express, { Request, Response } from 'express';
import { buyTicket } from './ticketService';  // We'll create this service later for ticket logic
import { publishTicketBoughtEvent } from '../../../packages/mq/queue' // 👈 import the publisher
import { Queue } from 'bullmq'
import { redisConfig, ticketQueue } from '../../../packages/mq/connection'
import { lockTicket, isTicketLocked , unlockTicket} from './ticketService'

const app = express();
const port = 3000;

app.use(express.json());

// const ticketQueue = new Queue('ticketQueue', { connection: redisConfig })



// Example endpoint to simulate ticket buying
app.post('/buy-ticket', async (req: Request, res: Response): Promise<void> => {

  // // Simulate the ticket-buying process
  // const result = await buyTicket(userId);

  // if (result.success) {
  //   res.status(200).send({ message: 'Ticket bought successfully!' });
  // } else {
  //   res.status(400).send({ message: result.error });
  // }
  // 👇 Check if ticket is already locked

  const { ticketId, userId } = req.body

  if (await isTicketLocked(ticketId)) {
    res.status(400).send({ success: false, message: 'Ticket is already locked or being purchased.' })
    return
  }

  // 👇 Lock the ticket
  const locked = await lockTicket(ticketId)
  if (!locked) {
    res.status(400).send({ success: false, message: 'Failed to lock the ticket.' })
    return
  }

  ticketQueue.add('buy-ticket', {
    ticketType: 'VIP',
    quantity: 2,
  }).then(job => {
    console.log(`Job added: ${job.id}`)
  }).catch(err => {
    console.error('Error adding job:', err)
  })

  // Publish an event to the queue
  // await publishTicketBoughtEvent({ ticketId, userId })

  res.status(201).send({ success: true })

});

app.post('/complete-purchase', async (req: Request, res: Response) => {
  const { ticketId, userId } = req.body

  // Confirm if locked
  if (!await isTicketLocked(ticketId)) {
    res.status(400).send({ success: false, message: 'Ticket lock expired or ticket not reserved.' })
    return
  }

  // Finalize payment (your logic here)

  // Unlock ticket manually if needed (or mark as sold in DB)
  await unlockTicket(ticketId)

  res.status(200).send({ success: true, message: 'Ticket purchased successfully!' })
})

app.listen(port, () => {
  console.log(`API server listening at http://localhost:${port}`);
});
