import express, { Request, Response } from 'express';
import { buyTicket } from './ticketService';  // We'll create this service later for ticket logic

const app = express();
const port = 3000;

app.use(express.json());

// Example endpoint to simulate ticket buying
app.post('/buy-ticket', async (req: Request, res: Response): Promise<void> =>  {
  const { userId } = req.body;
  
  // Simulate the ticket-buying process
  const result = await buyTicket(userId);
  
  if (result.success) {
    res.status(200).send({ message: 'Ticket bought successfully!' });
  } else {
    res.status(400).send({ message: result.error });
  }
});

app.listen(port, () => {
  console.log(`API server listening at http://localhost:${port}`);
});
