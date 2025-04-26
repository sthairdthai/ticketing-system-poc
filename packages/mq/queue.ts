// packages/mq/queue.ts
import { queueConnection } from './connection'

const TICKET_BOUGHT_QUEUE = 'ticket-bought'

export const publishTicketBoughtEvent = async (data: { ticketId: string, userId: string }) => {
  queueConnection.publish(TICKET_BOUGHT_QUEUE, data)
}

export const consumeTicketBoughtEvent = (handler: (data: { ticketId: string, userId: string }) => void) => {
  queueConnection.consume(TICKET_BOUGHT_QUEUE, handler)
}
