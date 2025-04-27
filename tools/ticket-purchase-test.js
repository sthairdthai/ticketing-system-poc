import { check, sleep } from 'k6';
import http from 'k6/http';
// import { randomIntBetween } from 'k6/utils';
// import { randomIntBetween } from 'k6/random'; // Update this to use k6/random

// Constants for the test
const BASE_URL = 'http://localhost:3000'; // Replace with your actual base URL

// Define options for the test
export let options = {
  // Stages define the ramp-up and ramp-down of VUs over time
  stages: [
    { duration: '10s', target: 5 }, // Ramp up to 1000 users in 10 seconds
    { duration: '30s', target: 5 }, // Maintain 1000 users for 30 seconds
    { duration: '10s', target: 0 },    // Ramp down to 0 users in 10 seconds
  ],
  // You can define additional options like thresholds or maximum VUs
  thresholds: {
    http_req_duration: ['p(95)<2000'], // 95% of requests should be below 2000ms
    http_req_failed: ['rate<0.05'],    // Fail rate should be less than 5%
  },
};

let availableTickets = [];

export default function () {
  // Step 1: Get the list of available tickets
  const res = http.get(`${BASE_URL}/api/ticket/available`);

  // Step 2: Validate the available tickets response
  check(res, {
    'Available tickets fetched successfully': (r) => r.status === 200,
    'Available tickets are not empty': (r) => r.json().length > 0,
  });

  // Store available tickets (assuming the response is an array of ticket IDs)
  availableTickets = res.json();

  // Step 3: Randomly pick a ticket to reserve
//   const ticketId = availableTickets[randomIntBetween(0, availableTickets.length - 1)];
const ticketId = availableTickets[Math.floor(Math.random() * availableTickets.length)];

  // Step 4: Reserve the ticket
  const reservePayload = JSON.stringify({ ticketId });
  const reserveRes = http.post(`${BASE_URL}/api/ticket/reserve`, reservePayload, {
    headers: { 'Content-Type': 'application/json' },
  });

  // Step 5: Check if the reservation was successful
  check(reserveRes, {
    'Ticket reserved successfully': (r) => r.status === 200,
    'Ticket reservation error': (r) => r.status !== 400,
  });

  // Step 6: Buy the reserved ticket
  const buyPayload = JSON.stringify({ ticketId });
  const buyRes = http.post(`${BASE_URL}/api/ticket/buy`, buyPayload, {
    headers: { 'Content-Type': 'application/json' },
  });

  // Step 7: Check if the ticket purchase was successful
  check(buyRes, {
    'Ticket bought successfully': (r) => r.status === 200,
    'Ticket purchase failed': (r) => r.status !== 400,
  });

  // Step 8: Pause for a random time (to simulate real-world behavior)
//   sleep(randomIntBetween(1, 3));
  sleep(Math.random() * 2 + 1); // Sleep for a random duration between 1 and 3 seconds
}
