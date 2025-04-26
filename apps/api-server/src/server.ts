import express from 'express'
import { ticketQueue } from '@mq/queue'
import { lockTicket, unlockTicket } from '@shared/lock'

const app = express()
app.use(express.json())

app.post('/tickets/reserve/:ticketId', async (req, res) => {
  const { ticketId } = req.params
  const { userId } = req.body

  if (!userId) {
    return res.status(400).json({ error: 'Missing userId' })
  }

  const lockKey = `lock:ticket:${ticketId}`

  const lockAcquired = await lockTicket(lockKey, 5000) // 5 seconds

  if (!lockAcquired) {
    return res.status(409).json({ error: 'Ticket is being reserved, try again' })
  }

  try {
    await ticketQueue.add('reserve', { ticketId, userId })
    return res.status(200).json({ message: 'Reservation request accepted' })
  } catch (error) {
    console.error('Failed to enqueue job', error)
    return res.status(500).json({ error: 'Internal server error' })
  } finally {
    await unlockTicket(lockKey)
  }
})

app.listen(3000, () => {
  console.log('API Server running on port 3000')
})
