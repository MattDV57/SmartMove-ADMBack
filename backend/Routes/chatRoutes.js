import express from "express";
import { Chat } from "../Models/chatModel.js";
import whatsappRoutes from "./whatsappRoutes.js";
import authenticateToken from "../utils/jwtChecker.js";

const router = express.Router();

//Se pueden pasar las funciones a un "controller" o "service" si se quiere
//Es temporal esto de hacer las operaciones en las rutas
//TODO: Agregar hacer catch de errores
//TODO: Mejores mensajes de errores

router.get("/:chatId", authenticateToken, async (req, res) => {
  try {
  } catch (error) {
    console.log(error);
    return res.status(500).send(error);
  }
});

export default router;
