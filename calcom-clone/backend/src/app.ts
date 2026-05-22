import express from 'express'
import cors from 'cors'

const app = express()

app.use(cors({ origin: 'http://localhost:5173', credentials: true }))
app.use(express.json())

app.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date() }))

export default app
