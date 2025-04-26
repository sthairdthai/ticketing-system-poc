import axios from 'axios';
// import faker from 'faker';

// Config
const API_BASE_URL = 'http://localhost:3000/api/ticket'; // Adjust the URL if necessary
const TOTAL_USERS = 10000;
const TOTAL_TICKETS = 100;

// Utility function to simulate random time intervals
const getRandomTime = (min, max) => Math.floor(Math.random() * (max - min) + min);

// Function to simulate a user buying a ticket
const simulateUserAction = async (userId) => {
  try {
    // Get a random ticket ID to reserve
    const ticketId = Math.floor(Math.random() * TOTAL_TICKETS) + 1;

    // Reserve a ticket
    console.log(`User ${userId} is attempting to reserve Ticket ${ticketId}`);
    const reserveResponse = await axios.post(`${API_BASE_URL}/reserve`, {
      userId: userId,
      ticketId: ticketId,
    });

    if (reserveResponse.data.success) {
      console.log(`User ${userId} successfully reserved Ticket ${ticketId}`);
      
      // Simulate a random delay before buying the ticket
      const buyDelay = getRandomTime(500, 3000); // Random delay between 500ms to 3s
      setTimeout(async () => {
        console.log(`User ${userId} is attempting to buy Ticket ${ticketId}`);
        await axios.post(`${API_BASE_URL}/buy`, {
          ticketId: ticketId,
          userId: userId,
        });
        console.log(`User ${userId} successfully bought Ticket ${ticketId}`);
      }, buyDelay);
    }
  } catch (error) {
    console.error(`Error for User ${userId}:`, error.message);
  }
};

// Function to simulate concurrent user actions
const simulateConcurrentUsers = async () => {
  const userPromises = [];

  for (let userId = 1; userId <= TOTAL_USERS; userId++) {
    userPromises.push(simulateUserAction(userId));

    // Introduce a slight delay to prevent overwhelming the server with requests at the same time
    await new Promise(resolve => setTimeout(resolve, getRandomTime(100, 500))); // Random delay between users' actions
  }

  // Wait for all user actions to complete
  await Promise.all(userPromises);
  console.log('Simulation complete.');
};

// Start simulation
simulateConcurrentUsers()
  .then(() => {
    console.log('All actions simulated.');
  })
  .catch(err => {
    console.error('Error during simulation:', err);
  });
