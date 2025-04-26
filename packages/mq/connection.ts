
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

export const queueMockConnection = new MockQueueConnection()

type Handler = (data: any) => void


class QueueConnection {
    private handlers: Record<string, Handler[]> = {}

    publish(queueName: string, data: any) {
        const handlers = this.handlers[queueName] || []
        handlers.forEach(handler => handler(data))
    }

    consume(queueName: string, handler: Handler) {
        if (!this.handlers[queueName]) {
            this.handlers[queueName] = []
        }
        this.handlers[queueName].push(handler)
    }
}

export const queueConnection = new QueueConnection()  