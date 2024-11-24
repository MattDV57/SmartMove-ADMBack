import "dotenv/config";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import { Server } from "socket.io";
import { createServer } from "http";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { pollQueue } from "./events/sqs/sqsConsumer.js";
import cookieParser from "cookie-parser";

import claimRoutes from "./routes/claimRoutes.js";
import loginRoutes from "./routes/loginRoutes.js";
import whatsAppRoutes from "./routes/whatsappRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import logRoutes from "./routes/logRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import socketHandler from "./sockets/socketHandler.js";
import eventsRoutes from "./events/eventsRoutes.js";
import { authenticateToken } from "./middlewares/authn.middleware.js";

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

const publicRoutes = [
  { url: "/login", methods: ["POST"] },
  { url: "/auth", methods: ["POST"] },
  { url: "/whatsapp", methods: ["GET", "POST"] },
  { url: "/whatsapp/webhook", methods: ["GET", "POST"] },
  { url: "/whatsapp/testTemplate", methods: ["POST"] },
  { url: "/whatsapp/send-message", methods: ["POST"] },
];

app.use((req, res, next) => {
  const isPublicRoute = publicRoutes.some(
    (route) => route.url === req.path && route.methods.includes(req.method)
  );

  if (isPublicRoute) {
    return next();
  }

  authenticateToken(req, res, next);
});

app.use("/claim", claimRoutes);
app.use("/login", loginRoutes);
app.use("/whatsapp", whatsAppRoutes);
app.use("/auth", authRoutes);
app.use("/log", logRoutes);
app.use("/users", userRoutes);
app.use("/events", eventsRoutes);

socketHandler(io);

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
