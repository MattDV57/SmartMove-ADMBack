import "dotenv/config.js";

import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import { Server } from "socket.io";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import http from "http";

import chatRoutes from "./Routes/chatRoutes.js";
import claimRoutes from "./Routes/claimRoutes.js";
import loginRoutes from "./Routes/loginRoutes.js";
import whatsAppRoutes from "./Routes/whatsappRoutes.js";
import authRoutes from "./Routes/authRoutes.js";
import logRoutes from "./Routes/logRoutes.js";
import socketHandler from "./Sockets/socketHandler.js";

const app = express();
app.use(express.json());

//Aceptar CORS para que se pueda llamar desde app externa
app.use(cors());

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
// Publish page for testing socket.io chat
app.use(express.static(join(__dirname, "public")));

const server = http.createServer(app);
const io = new Server(server); // Inicializar socket.io

//Definicion base de las rutas
app.use("/chat", chatRoutes);
app.use("/claim", claimRoutes);
app.use("/login", loginRoutes);
app.use("/whatsapp", whatsAppRoutes);
app.use("/auth", authRoutes);
app.use("/log", logRoutes);

// Listen for connections in socket.io
socketHandler(io);

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
