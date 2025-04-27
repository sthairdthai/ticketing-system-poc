import express from 'express';
import { reserveTicket, buyTicket, getAvailableTickets, releaseTicket } from './ticketService'; // Adjust path as needed

const app = express();
const port = 3000;

app.use(express.json());

// Endpoint to get available tickets
app.get('/api/ticket/available', (req, res) => {
  const availableTickets = getAvailableTickets(); // Get the list of available tickets
  res.json({ availableTickets });
});

// Endpoint to reserve a ticket
app.post('/api/ticket/reserve', async (req, res) => {
  const { userId, ticketId } = req.body;
  const result = await reserveTicket(userId, ticketId);
  if (result.success) {
    res.status(200).json({ success: true, ticketId: result.ticketId });
  } else {
    res.status(400).json(result);
  }
});

app.post(`/api/ticket/release`, async (req, res) => {
  const { ticketId } = req.body;
  if (!ticketId) {
    res.status(400).json({ error: 'Ticket ID is required' });
  }
  else {
    await releaseTicket(ticketId); // Release the ticket using the service
    res.status(200).json({ success: true, message: `Ticket ${ticketId} released successfully` });
  }
});

// Endpoint to buy a reserved ticket
app.post('/api/ticket/buy', async (req, res) => {
  const { ticketId, userId } = req.body;
  await buyTicket({ ticketId, userId });
  res.status(200).json({ success: true, message: `Ticket ${ticketId} purchased by user ${userId}` });
});

app.listen(port, () => {
  console.log(`API server running at http://localhost:${port}`);
});
