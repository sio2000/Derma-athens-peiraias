const path = require('path')
const createApp = require('./createApp')

const PORT = Number(process.env.PORT) || 3001

const app = createApp()

app.listen(PORT, () => {
  console.log(`Booking API listening on http://localhost:${PORT}`)
  console.log(`Data directory: ${path.join(__dirname, 'data')}`)
})
