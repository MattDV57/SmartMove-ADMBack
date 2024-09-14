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
import socketHandler from "./Sockets/socketHandler.js";

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
app.use("/claim", claimRoutes);

// Listen for connections
socketHandler(io);

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
