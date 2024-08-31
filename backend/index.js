import "dotenv/config.js";

import express from "express";
import mongoose from "mongoose";
import cors from "cors";

import chatRoutes from "./Routes/chatRoutes.js";

const app = express();
app.use(express.json());
app.use(cors());

app.use("/chat", chatRoutes);

mongoose
  .connect(process.env.mongoConnectionString)
  .then(() => {
    app.listen(3000, () => {
      console.log("App is running on port = " + 3000);
    });
  })
  .catch((error) => {
    console.log(error);
  });
