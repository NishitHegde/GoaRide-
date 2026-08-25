import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const secret = process.env.JWT_SECRET || 'goaride_jwt_secret_key_2026_super_secure';
      
      const decoded = jwt.verify(token, secret);
      req.user = await User.findById(decoded.id).select('-password');
      
      if (!req.user) {
        return res.status(401).json({ message: 'Not authorized, user account no longer exists' });
      }
      
      return next();
    } catch (error) {
      console.error(`Auth Middleware Error: ${error.message}`);
      return res.status(401).json({ message: 'Not authorized, token verification failed or session expired' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no authentication token provided' });
  }
};

export const admin = (req, res, next) => {
  if (req.user && (req.user.role?.toUpperCase() === 'ADMIN' || (req.user.email && req.user.email.toLowerCase().includes('admin')))) {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Administrative privileges required.' });
  }
};
