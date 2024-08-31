import "dotenv/config.js";

import express from "express";
import mongoose from "mongoose";
import cors from "cors";

import chatRoutes from "./Routes/chatRoutes.js";

const app = express();
app.use(express.json());

//Aceptar CORS para que se pueda llamar desde app externa
app.use(cors());

//Definicion base de las rutas
app.use("/chat", chatRoutes);

mongoose
  .connect(process.env.mongoConnectionString)
  .then(() => {
    app.listen(process.env.PORT, () => {
      console.log("App is running on port = " + process.env.PORT);
    });
  })
  .catch((error) => {
    console.log(error);
  });
