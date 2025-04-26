import axios from 'axios';
import { v4 as uuidv4 } from 'uuid'; // For generating unique user and ticket IDs
import { setTimeout } from 'timers/promises';

const TOTAL_USERS = 1000;
const TOTAL_TICKETS = 100;
const RESERVATION_TIMEOUT = 5 * 60 * 1000;  // 5 minutes

// Base URL of your API server
const API_BASE_URL = 'http://localhost:3000'; // Replace with your actual API server URL

// Function to simulate a user reserving and buying a ticket via HTTP requests
async function simulateUser(userId: string, ticketId: string) {
  try {
    console.log(`User ${userId} is reserving ticket ${ticketId}`);

    // Step 1: Reserve the ticket via API
    await axios.post(`${API_BASE_URL}/api/tickets/reserve`, { userId, ticketId });

    console.log(`User ${userId} reserved ticket ${ticketId}`);

    // Step 2: Simulate a random time delay to either complete the purchase or let the reservation expire
    const delayBeforeBuying = Math.random() * RESERVATION_TIMEOUT;  // Random delay up to reservation timeout
    console.log(`User ${userId} has ${delayBeforeBuying / 1000} seconds to complete the purchase`);

    await setTimeout(delayBeforeBuying);  // Simulate the waiting time

    // Step 3: Simulate either completing the purchase or letting it expire
    if (Math.random() > 0.5) {
      console.log(`User ${userId} is buying ticket ${ticketId}`);
      await axios.post(`${API_BASE_URL}/api/tickets/buy`, { userId, ticketId });
    } else {
      console.log(`User ${userId} did not complete the purchase, releasing ticket ${ticketId}`);
      // You could add a call to release the ticket if your API supports that
    }
  } catch (error) {
    console.error(`Error processing reservation/purchase for User ${userId}, Ticket ${ticketId}:`, error);
  }
}

// Generate users and tickets
async function runTest() {
  // Create 1000 users and 100 tickets
  for (let userIndex = 1; userIndex <= TOTAL_USERS; userIndex++) {
    const userId = `user-${userIndex}`;
    const ticketId = `ticket-${(userIndex % TOTAL_TICKETS) + 1}`;  // Ensure only 100 unique tickets
    await simulateUser(userId, ticketId);
  }
}

// Start the test script
runTest().catch(console.error);
