import express, { Request, Response } from 'express';
import { buyTicket } from './ticketService';  // We'll create this service later for ticket logic
import { publishTicketBoughtEvent } from '../../../packages/mq/queue' // 👈 import the publisher


const app = express();
const port = 3000;

app.use(express.json());

// Example endpoint to simulate ticket buying
app.post('/buy-ticket', async (req: Request, res: Response): Promise<void> => {
  // const { userId } = req.body;

  // // Simulate the ticket-buying process
  // const result = await buyTicket(userId);

  // if (result.success) {
  //   res.status(200).send({ message: 'Ticket bought successfully!' });
  // } else {
  //   res.status(400).send({ message: result.error });
  // }

  const { ticketId, userId } = req.body

  // Normally, you'd check payment etc. here
  console.log(`Ticket purchased: TicketID=${ticketId}, UserID=${userId}`)

  // Publish an event to the queue
  await publishTicketBoughtEvent({ ticketId, userId })

  res.status(201).send({ success: true })

});

app.listen(port, () => {
  console.log(`API server listening at http://localhost:${port}`);
});
