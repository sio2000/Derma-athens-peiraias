const express = require('express')
const cors = require('cors')
const publicRoutes = require('./routes/publicRoutes')
const adminRoutes = require('./routes/adminRoutes')

/** Express app για τοπικό server και για Netlify Function (serverless-http). */
function createApp() {
  const app = express()
  app.use(
    cors({
      origin: true,
      credentials: true,
    }),
  )
  app.use(express.json({ limit: '512kb' }))

  app.use('/api', publicRoutes)
  app.use('/api/admin', adminRoutes)

  app.get('/health', (_req, res) => {
    res.json({ ok: true })
  })

  app.use((err, _req, res, _next) => {
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  })

  return app
}

module.exports = createApp
