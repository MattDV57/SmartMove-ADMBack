import "dotenv/config.js";

import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import { Server } from "socket.io";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import http from "http";

import chatRoutes from "./Routes/chatRoutes.js";

const app = express();
app.use(express.json());

//Aceptar CORS para que se pueda llamar desde app externa
app.use(cors());
// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Serve static files from the "public" directory
app.use(express.static(join(__dirname, "public")));

const server = http.createServer(app);
const io = new Server(server); // Initialize Socket.IO server

//Definicion base de las rutas
app.use("/chat", chatRoutes);

// Listen for connections
io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  // Join a room
  socket.on("joinRoom", ({ username, room }) => {
    socket.join(room);
    console.log(`${username} joined room: ${room}`);
    // Broadcast to the room that a new user has joined
    socket.to(room).emit("message", `${username} has joined the chat`);
  });

  // Handle sending messages to a room
  socket.on("chatMessage", (messageObject) => {
    const { body, from, to } = messageObject;
    io.to(to).emit("message", `${from}: ${body}`);
    console.log(messageObject);
  });

  // Handle user disconnection
  socket.on("disconnect", () => {
    console.log(`${username} disconnected`);
    io.to(room).emit("message", `${username} has left the chat`);
  });
});

mongoose
  .connect(process.env.mongoConnectionString)
  .then(() => {
    server.listen(process.env.PORT, () => {
      console.log("App is running on port = " + process.env.PORT);
    });
  })
  .catch((error) => {
    console.log(error);
  });
