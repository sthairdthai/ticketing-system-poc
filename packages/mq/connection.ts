// packages/mq/connection.ts
export class MockQueueConnection {
    publish(queueName: string, message: any) {
      console.log(`[Publish] Queue: ${queueName}, Message:`, message)
    }
  
    consume(queueName: string, handler: (message: any) => void) {
      console.log(`[Consume] Listening on Queue: ${queueName}`)
      // simulate an incoming message after 2 seconds
      setTimeout(() => {
        handler({ text: 'Sample message from queue.' })
      }, 2000)
    }
  }
  
  export const queueConnection = new MockQueueConnection()
  