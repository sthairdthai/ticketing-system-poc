import { check, sleep } from 'k6';
import http from 'k6/http';

// Constants for the test
const BASE_URL = 'http://localhost:3000'; // Replace with your actual base URL

// Define options for the test
export let options = {
  // Stages define the ramp-up and ramp-down of VUs over time
  stages: [
    { duration: '10s', target: 100 }, // Ramp up to 1000 users in 10 seconds
    { duration: '30s', target: 100 }, // Maintain 1000 users for 30 seconds
    { duration: '10s', target: 0 },    // Ramp down to 0 users in 10 seconds
  ],
  // You can define additional options like thresholds or maximum VUs
  thresholds: {
    http_req_duration: ['p(95)<2000'], // 95% of requests should be below 2000ms
    http_req_failed: ['rate<0.05'],    // Fail rate should be less than 5%
  },
};

let availableTickets = [];

// Utility function to generate random userId
function generateUserId() {
  return `user-${Math.floor(Math.random() * 1000000)}`;
}

export default function () {
  const userId = generateUserId();  // Generate a random userId for each virtual user

  // Step 1: Get the list of available tickets
  const res = http.get(`${BASE_URL}/api/ticket/available`);

  // Step 2: Validate the available tickets response
  check(res, {
    'Available tickets fetched successfully': (r) => r.status === 200,
    'Available tickets are not empty': (r) => r.json().availableTickets.length > 0,
  });

  // Store available tickets (assuming the response contains an `availableTickets` array)
  availableTickets = res.json().availableTickets;

  // Step 3: Randomly pick a ticket to reserve using Math.random()
  const ticketId = availableTickets[Math.floor(Math.random() * availableTickets.length)];

  // Step 4: Reserve the ticket
  const reservePayload = JSON.stringify({ userId, ticketId });
  const reserveRes = http.post(`${BASE_URL}/api/ticket/reserve`, reservePayload, {
    headers: { 'Content-Type': 'application/json' },
  });

  // Step 5: Check if the reservation was successful
  check(reserveRes, {
    'Ticket reserved successfully': (r) => r.status === 200,
    'Ticket reservation error': (r) => r.status !== 400,
  });

  // Step 6: Buy the reserved ticket
  const buyPayload = JSON.stringify({ userId, ticketId });
  const buyRes = http.post(`${BASE_URL}/api/ticket/buy`, buyPayload, {
    headers: { 'Content-Type': 'application/json' },
  });

  // Step 7: Check if the ticket purchase was successful
  check(buyRes, {
    'Ticket bought successfully': (r) => r.status === 200,
    'Ticket purchase failed': (r) => r.status !== 400,
  });

  // Step 8: Pause for a random time (to simulate real-world behavior)
  sleep(Math.random() * 2 + 1); // Sleep for a random duration between 1 and 3 seconds
}
