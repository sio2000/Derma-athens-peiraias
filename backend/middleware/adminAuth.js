const { isValidToken } = require('../services/adminAuth')

function adminAuthMiddleware(req, res, next) {
  const auth = req.headers.authorization || ''
  const m = /^Bearer\s+(.+)$/i.exec(auth)
  const token = m ? m[1].trim() : ''
  if (!isValidToken(token)) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
  next()
}

module.exports = { adminAuthMiddleware }
