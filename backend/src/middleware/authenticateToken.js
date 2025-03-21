import jwt from 'jsonwebtoken';
import { User } from '../models/userModel.js';


const authenticateToken = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1]; // Format: "Bearer <token>"
  
    if (!token) {
      return res.status(401).json({ message: "Unauthorized: No token provided" });
    }
  
    try {
      const decoded = jwt.verify(token, process.env.TOKEN_SECRET);
      const user = await User.findById(decoded.id);
  
      if (!user || user.token !== token) {
        return res.status(401).json({ message: "Unauthorized: Invalid token" });
      }
  
      req.user = user;
      next();
    } catch (error) {
      return res.status(401).json({ message: "Unauthorized: Invalid or expired token" });
    }
};

export default authenticateToken;