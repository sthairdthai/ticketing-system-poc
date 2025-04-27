# POC System Documentation

This document describes the Proof of Concept (POC) system created for ticket reservation and purchase processing. The system involves backend API handling, ticket reservation, release logic, and batch processing for ticket purchase. It also includes a stress test script to validate the system under load.

## Tech Stack

### 1. **Express.js**
   - **Purpose**: The backend API is built using Express.js to handle the HTTP requests for the ticket reservation and purchase system.
   - **Location**: The main server file is located at `apps/api-server/src/server.ts`.

### 2. **Redis & BullMQ**
   - **Purpose**: Redis is used for in-memory data storage, and BullMQ is employed to handle job queues for the reservation ticket system.
   - **Reservation Ticket Queue**: The ticket reservation is locked for 1 minute before being automatically released if the purchase is not completed by the same user. This ensures that tickets are not held indefinitely.
   - **Location**: The reservation queue logic is managed through BullMQ in the worker system.

### 3. **Reservation Ticket Worker**
   - **Purpose**: A worker checks the reservation tickets and ensures that tickets are properly released if the purchase is not completed in time.
   - **Location**: The worker responsible for releasing the reservation is located at `apps/worker/src/workerReleaseReservation.ts`.

### 4. **Purchase Ticket Queue & Worker**
   - **Purpose**: Once the reservation is completed, a ticket purchase job is added to the purchase ticket queue. A worker processes these jobs in batches and publishes messages to other services for further processing (e.g., payment gateway, order fulfillment).
   - **Location**: The worker that processes ticket purchases is located at `apps/worker/src/workerBuyTicket.ts`.

### 5. **Stress Test Script**
   - **Purpose**: A stress test script is provided to simulate multiple ticket purchases and assess the system’s performance under load.
   - **Location**: The stress test script is located at `tools/ticket-purchase-test.js`.

## How to Run the System

### Step 1: Set Up Redis

Ensure that Redis is installed and running on your machine or on a cloud service like Redis Cloud. You'll need Redis to manage the queues for both the ticket reservation and purchase processes.

### Step 2: Install Dependencies

Install the necessary dependencies using `pnpm`:

```bash
pnpm install
