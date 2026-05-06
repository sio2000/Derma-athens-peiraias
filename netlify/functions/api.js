const fs = require('fs')
const path = require('path')
const serverless = require('serverless-http')

/**
 * Το ZIP της function σε production έχει συνήθως root = __dirname (/var/task) και φάκελο `backend/` δίπλα.
 * Στο repo, το αρχείο είναι σε `netlify/functions/` και το backend στην ρίζα — χρειάζεται `../..`.
 */
function resolveCreateApp() {
  const candidates = [
    path.join(__dirname, 'backend', 'createApp.js'),
    path.join(__dirname, '..', '..', 'backend', 'createApp.js'),
  ]
  const errors = []
  for (const p of candidates) {
    try {
      if (!fs.existsSync(p)) {
        errors.push(`${p}: not found`)
        continue
      }
      // eslint-disable-next-line import/no-dynamic-require
      const mod = require(p)
      if (typeof mod !== 'function') {
        errors.push(`${p}: expected function export`)
        continue
      }
      return mod
    } catch (e) {
      errors.push(`${p}: ${e && e.message ? e.message : e}`)
    }
  }
  console.error('[api] resolveCreateApp failed:', errors.join('; '))
  throw new Error(`[api] could not load createApp (${errors.join('; ')})`)
}

const createAppFactory = resolveCreateApp()
const app = createAppFactory()

exports.handler = serverless(app)
