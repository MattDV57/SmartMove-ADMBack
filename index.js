import 'dotenv/config'
import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import { Server } from 'socket.io'
import { createServer } from 'http'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { pollQueue } from './events/sqsConsumer.js'

import cookieParser from "cookie-parser";
// import chatRoutes from "./Routes/chatRoutes.js";
import claimRoutes from './routes/claimRoutes.js'
import loginRoutes from './routes/loginRoutes.js'
import whatsAppRoutes from './routes/whatsappRoutes.js'
import authRoutes from './routes/authRoutes.js'
import logRoutes from './routes/logRoutes.js'
import userRoutes from './routes/userRoutes.js'
import socketHandler from './sockets/socketHandler.js'

const app = express();
app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.use(express.static(join(__dirname, "public")));

const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: true,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// app.use("/chat", chatRoutes);
app.use("/claim", claimRoutes);
app.use("/login", loginRoutes);
app.use("/whatsapp", whatsAppRoutes);
app.use("/auth", authRoutes);
app.use("/log", logRoutes);
app.use("/users", userRoutes);

socketHandler(io)

// pollQueue();

mongoose
  .connect(process.env.MONGO_CONNECTION_STRING)
  .then(() => {
    server.listen(process.env.PORT, () => {
      console.log("App is running on port = " + process.env.PORT);
    });
  })
  .catch((error) => {
    console.log(error);
  });
