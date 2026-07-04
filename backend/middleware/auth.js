const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No authentication token provided, authorization denied.' });
    }

    const token = authHeader.replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'skillforge_secure_jwt_token_secret_9988');
    
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: 'User not found, authorization denied.' });
    }

    // Manually omit password field from user data
    if (user.password) {
      delete user.password;
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is invalid or expired.' });
  }
};

module.exports = auth;
