import axios from 'axios';

// Config
const API_BASE_URL = 'http://localhost:3000/api/ticket'; // Adjust the URL if necessary
const TOTAL_USERS = 10000;

// Utility function to simulate random time intervals
const getRandomTime = (min, max) => Math.floor(Math.random() * (max - min) + min);

// Function to get available tickets from the server
const getAvailableTickets = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/available`);
    return response.data.availableTickets;
  } catch (error) {
    console.error('Error fetching available tickets:', error.message);
    return [];
  }
};

// Function to simulate a user buying a ticket
const simulateUserAction = async (userId) => {
  try {
    // Get the available tickets
    const availableTickets = await getAvailableTickets();
    if (availableTickets.length === 0) {
      console.log(`No tickets available for User ${userId}`);
      return;
    }

    // Get a random ticket ID from the available tickets
    const ticketId = availableTickets[Math.floor(Math.random() * availableTickets.length)];

    // Reserve a ticket
    console.log(`User ${userId} is attempting to reserve Ticket ${ticketId}`);
    const reserveResponse = await axios.post(`${API_BASE_URL}/reserve`, {
      userId: userId,
      ticketId: ticketId,
    });

    if (reserveResponse.data.success) {
      console.log(`User ${userId} successfully reserved Ticket ${ticketId}`);
      
      // Simulate a random delay before buying the ticket
      const buyDelay = getRandomTime(500, 1000); // Random delay between 500ms to 3s
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
