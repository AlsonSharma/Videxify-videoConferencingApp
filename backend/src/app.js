import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import {createServer} from "node:http";
import { connectToSocket } from './controllers/socketManager.js';
import mongoose from "mongoose";
import cors from "cors";
import userRoutes from "./routes/userRoutes.js";
import Stripe from "stripe";
import cookieParser from "cookie-parser";

const app = express();
const server = createServer(app);
const io = connectToSocket(server);

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

app.set("port", (process.env.PORT || 8000))
app.use(cors({
  origin: "http://localhost:5173" || "https://videxify-videoconferencingapp-1.onrender.com/",
  credentials: true
}));
app.use(express.json({limit: "40kb"}));
app.use(express.urlencoded({limit: "40kb", extended: true}));
app.use(cookieParser());

app.use("/api/v1/users", userRoutes);

const start = async() => {
    const Db = await mongoose.connect(process.env.MONGO_URI);
    server.listen(app.get("port"), () => {
        console.log("Listening on port 8000");
    })
}
start();

app.post('/create-payment-intent', async (req, res) => {
  try {
    const { amount } = req.body;
    
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount, 
      currency: 'usd',
    });

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


  