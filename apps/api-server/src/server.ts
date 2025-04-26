import express, { Request, Response } from 'express';
import { publishTicketPurchase } from '../../../packages/mq/queue';
import { reserveTicket, buyTicket } from './ticketService';

const app = express();
const port = 3000;

app.use(express.json());

// Endpoint to reserve a ticket
app.post('/reserve-ticket', async (req: Request, res: Response) => {
  const { userId } = req.body;
  const result = await reserveTicket(userId);
  if (result.success) {
    res.status(200).send({ message: 'Ticket reserved successfully!' });
  } else {
    res.status(400).send({ message: result.error });
  }
});

// Endpoint to complete ticket purchase
app.post('/buy-ticket', async (req: Request, res: Response) => {
  const { ticketId, userId } = req.body;
  await publishTicketPurchase({ ticketId, userId });
  await buyTicket({ ticketId, userId });
  res.status(201).send({ success: true });
});

app.listen(port, () => {
  console.log(`API server listening at http://localhost:${port}`);
});
