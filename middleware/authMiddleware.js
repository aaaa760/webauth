const jwt = require('jsonwebtoken');
const User = require('../models/user');

/**
 * Middleware function to verify JWT token in the Authorization header.
 * If the token is valid, it sets the `req.user` object to the decoded user from the token.
 * If the token is invalid or missing, it returns a 401 Unauthorized error.
 */
const authMiddleware = async (req, res, next) => {
  const authHeader = req.header('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Please provide a valid JWT token' });
  }
  const token = authHeader.replace('Bearer ', '');
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({ email: decoded.email });

    if (!user) {
      throw new Error();
    }

    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Please authenticate' });
  }
};

module.exports = authMiddleware;
