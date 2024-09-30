import express from "express";
import { Chat } from "../Models/chatModel.js";
import authenticateToken from "../utils/jwtChecker.js";

const router = express.Router();

//Se pueden pasar las funciones a un "controller" o "service" si se quiere
//Es temporal esto de hacer las operaciones en las rutas
//TODO: Agregar hacer catch de errores
//TODO: Mejores mensajes de errores

router.get("/:chatId", authenticateToken, async (req, res) => {
  try {
    const foundChat = await Chat.findOne({ _id: req.params.chatId });

    if (!foundChat) {
      return res.status(404).send({
        message: "Chat not found",
        chatId: req.params.chatId,
        timestamp: new Date(),
      });
    }

    return res.status(200).send(foundChat);
  } catch (error) {
    console.log(error);
    return res.status(500).send(error);
  }
});

export default router;
