import jwt from 'jsonwebtoken';
import { User } from '../models/userModel';

const authenticateToken = async (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized: No token provided' });
  }

  try {
    // Verify the JWT token
    const decoded = jwt.verify(token, process.env.TOKEN_SECRET);
    
    // Find the user and check if the token matches
    const user = await User.findById(decoded.id);
    if (!user || user.token !== token) {
      return res.status(401).json({ message: 'Unauthorized: Invalid token' });
    }

    // Attach the user to the request
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Unauthorized: Invalid or expired token' });
  }
};

export default authenticateToken;