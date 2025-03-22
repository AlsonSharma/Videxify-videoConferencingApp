import { User } from "../models/userModel.js";
import { Meeting } from "../models/meetingModel.js";
import httpStatus from "http-status";
import bcrypt from "bcrypt";
import jwt from 'jsonwebtoken';
import validator from "validator";
import dotenv from 'dotenv';
dotenv.config();

const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12;
const tokenSecret = process.env.TOKEN_SECRET || "defaultSecret";

const login = async(req, res) => {
    const {username, password} = req.body;

    if(!username || !password || !validator.isAlphanumeric(username)) {
        return res.status(httpStatus.BAD_REQUEST).json({message: "Invalid Input"})
    }
    try {
        const user = await User.findOne({username});
        if(!user) {
           return res.status(httpStatus.NOT_FOUND).json({message: "User not found"})
        }
        let isPasswordValid = await bcrypt.compare(password, user.password)
        if(isPasswordValid) {
            let token = jwt.sign({ id: user._id }, tokenSecret, { expiresIn: '1h' })
            user.token = token;
            await user.save();

             res.cookie('token', token, {
                httpOnly: true,
                sameSite: 'none',
                path: '/',
                domain: '.onrender.com',
                secure: true,
                maxAge: 3600000 // 1 hour
            });

            return res.status(httpStatus.OK).json({message: "Login successfull"});
        } else {
            return res.status(httpStatus.UNAUTHORIZED).json({message: "Invalid Username or Password"});
        }
    } catch (error) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({message: `Internal server error`})
    }
}

const register = async(req, res) => {
    const {name, username, password} = req.body;

     // Input Validation
     if (!name || !username || !password || !validator.isAlphanumeric(username)) {
        return res.status(httpStatus.BAD_REQUEST).json({ message: "Invalid input" });
    }
    try {
        const existingUser = await User.findOne({username});
        if(existingUser) {
            return res.status(httpStatus.CONFLICT).json({message: "User already exists"});
        }
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        const newUser = new User({
            name: name, 
            username: username,
            password: hashedPassword
        });
        await newUser.save();
       return res.status(httpStatus.CREATED).json({message: "User Registered"});
    } catch (error) {
       return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({message: `Internal server error`});
    }
}

const getUserHistory = async (req, res ) => {
    const token = req.cookies.token;

    try {
        const decoded = jwt.verify(token, tokenSecret);
        const user = await User.findById(decoded.id);
        if (!user) {
            return res.status(httpStatus.NOT_FOUND).json({ message: "User not found" });
        }

        const meetings = await Meeting.find({ user_id: user.username });
        return res.status(httpStatus.OK).json(meetings);
    } catch (err) {
        return res.status(httpStatus.UNAUTHORIZED).json({ message: "Invalid or expired token" });
    }
}

const addToHistory = async (req, res) => {
    const token = req.cookies.token;
    const { meeting_code } = req.body;

    try {
        const decoded = jwt.verify(token, tokenSecret);
        const user = await User.findById(decoded.id);
        if (!user) {
            return res.status(httpStatus.NOT_FOUND).json({ message: "User not found" });
        }

        const newMeeting = new Meeting({
            user_id: user.username,
            meetingCode: meeting_code
        });

        await newMeeting.save();
        return res.status(httpStatus.CREATED).json({ message: "Added code to history" });
    } catch (error) {
        return res.status(httpStatus.UNAUTHORIZED).json({ message: "Invalid or expired token" });
    }
}

const validateSession = (req, res) => {
  
  return res.status(200).json({ 
    message: "Authenticated", 
    user: {
      id: req.user._id,
      username: req.user.username,
      name: req.user.name
    }
  });
};


export {login, register, validateSession, getUserHistory, addToHistory};