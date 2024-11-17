import "dotenv/config";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import { Server } from "socket.io";
import { createServer } from "http";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { pollQueue } from "./events/sqsConsumer.js";

import { Chat } from "./models/chatModel.js";
import { isValidObjectId } from "mongoose";

import cookieParser from "cookie-parser";
// import chatRoutes from "./Routes/chatRoutes.js";
import claimRoutes from "./routes/claimRoutes.js";
import loginRoutes from "./routes/loginRoutes.js";
import whatsAppRoutes from "./routes/whatsappRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import logRoutes from "./routes/logRoutes.js";
import userRoutes from "./routes/userRoutes.js";

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

app.use((req, res, next) => {
  res.setHeader("Content-Security-Policy", "default-src https: http:");
  next();
});

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

io.on("connection", (socket) => {
  socket.on("createChat", async () => {
    const newChatHistory = await Chat.create({});
    const chatId = newChatHistory._id.toString();
    socket.emit("message", chatId);

    socket.join(chatId);
  });

  socket.on("joinChat", async (chat) => {
    try {
      if (!isValidObjectId(chat)) {
        //ChatId is not a Mongo object Id, it doesnt exist
        socket.emit("message", "Not a valid room id for chatID: " + chat);
        return;
      }

      const isInChat = socket.rooms.has(chat);

      const chatFound = await Chat.findById(chat);

      socket.join(chat);

      if (chatFound && chatFound.messages && chatFound.messages.length > 0) {
        chatFound.messages.map((message) => {
          socket.emit("message", message);
        });
      }
    } catch (error) {
      console.log(error);
    }
  });

  socket.on("chatMessage", async (messageObject) => {
    try {
      const { body, from, sender, chatId } = messageObject;
      if (!isValidObjectId(chatId)) {
        return;
      }
      const newMessage = {
        from: from,
        body: body,
        sender: sender,
      };

      const chat = await Chat.findById(chatId);
      if (!chat || !chat.active) {
        return;
      }

      const updatedChat = await Chat.findOneAndUpdate(
        { _id: chatId },
        { $push: { messages: newMessage } },
        { new: true, useFindAndModify: false }
      );

      if (updatedChat) {
        socket.join(chatId);
        io.to(chatId).emit("message", newMessage);
      }
    } catch (error) {
      console.log(error);
    }
  });
  socket.on("disconnect", () => {
    console.log(` disconnected`);
  });
});

app.set("socketio", io);

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
