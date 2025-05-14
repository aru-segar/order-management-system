// authMiddleware.js

function verifyToken(req, res, next) {
  const authHeader = req.headers['authorization'];

  if (!authHeader) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  try {
    // Support both "Bearer <token>" and plain token
    const token = authHeader.startsWith('Bearer ')
      ? authHeader.split(' ')[1]
      : authHeader;

    // Decode base64 and parse JSON to get { id, role }
    const decoded = JSON.parse(Buffer.from(token, 'base64').toString('utf8'));

    // Attach to request
    req.user = decoded;

    next();
  } catch (err) {
    return res.status(403).json({ error: 'Invalid token format.' });
  }
}

function requireRole(role) {
  return function (req, res, next) {
    if (!req.user || req.user.role !== role) {
      return res.status(403).json({ error: 'Access denied. Insufficient permissions.' });
    }
    next();
  };
}

module.exports = {
  verifyToken,
  requireRole,
};
