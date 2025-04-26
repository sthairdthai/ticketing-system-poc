import express, { Request, Response } from 'express';
import { publishTicketPurchase } from '../../../packages/mq/queue';
import { reserveTicket, buyTicket } from './ticketService';

const app = express();
const port = 3000;

app.use(express.json());

// Endpoint to reserve a ticket
app.post('/reserve-ticket', async (req: Request, res: Response) => {
  const { userId } = req.body;
  console.log(`User ${userId} is attempting to reserve a ticket...`);
  const result = await reserveTicket(userId);
  if (result.success) {
    console.log(`User ${userId} reserved a ticket successfully.`);
    res.status(200).send({ message: 'Ticket reserved successfully!' });
  } else {
    console.log(`User ${userId} failed to reserve a ticket: ${result.error}`);
    res.status(400).send({ message: result.error });
  }
});

// Endpoint to complete ticket purchase
app.post('/buy-ticket', async (req: Request, res: Response) => {
  const { ticketId, userId } = req.body;
  console.log(`User ${userId} is attempting to purchase Ticket ${ticketId}...`);
  await publishTicketPurchase({ ticketId, userId });
  await buyTicket({ ticketId, userId });
  console.log(`Ticket ${ticketId} purchase for User ${userId} initiated.`);
  res.status(201).send({ success: true });
});

app.listen(port, () => {
  console.log(`API server listening at http://localhost:${port}`);
});