const crypto = require('crypto')

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'advanced12!34derma'
/** Σε production ορίστε ADMIN_JWT_SECRET στο Netlify (Site settings → Environment). */
const ADMIN_JWT_SECRET = process.env.ADMIN_JWT_SECRET || 'dev-only-set-admin-jwt-secret-in-netlify'

function signToken() {
  const exp = Math.floor(Date.now() / 1000) + 8 * 3600
  const payloadB64 = Buffer.from(JSON.stringify({ exp }), 'utf8').toString('base64url')
  const sig = crypto.createHmac('sha256', ADMIN_JWT_SECRET).update(payloadB64).digest('base64url')
  return `${payloadB64}.${sig}`
}

/** @returns {string | null} */
function login(password) {
  if (password !== ADMIN_PASSWORD) return null
  return signToken()
}

/** @param {unknown} token */
function isValidToken(token) {
  if (typeof token !== 'string' || !token.includes('.')) return false
  const dot = token.indexOf('.')
  const payloadB64 = token.slice(0, dot)
  const sig = token.slice(dot + 1)
  const expectedSig = crypto.createHmac('sha256', ADMIN_JWT_SECRET).update(payloadB64).digest('base64url')
  const ba = Buffer.from(sig, 'utf8')
  const bb = Buffer.from(expectedSig, 'utf8')
  if (ba.length !== bb.length) return false
  if (!crypto.timingSafeEqual(ba, bb)) return false
  try {
    const payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf8'))
    const exp =
      typeof payload.exp === 'number' ? payload.exp : Number.parseInt(String(payload.exp), 10)
    return Number.isFinite(exp) && Math.floor(Date.now() / 1000) <= exp
  } catch {
    return false
  }
}

module.exports = { login, isValidToken }
