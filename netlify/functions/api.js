const serverless = require('serverless-http')
const path = require('path')
const root = path.join(__dirname, '..', '..')
const createApp = require(path.join(root, 'backend', 'createApp.js'))

/** Single handler: /api/* και /health μέσω netlify.toml → εδώ (ίδια routes με το Express τοπικά). */
const app = createApp()

exports.handler = serverless(app)
