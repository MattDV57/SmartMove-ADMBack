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
    return res.status(200).send(foundChat);
  } catch (error) {
    console.log(error);
    return res.status(500).send(error);
  }
});

router.put("/:chatId", authenticateToken, async (req, res) => {
  try {
    const newMessage = {
      from: "Otra persona",
      body: "Este es un nuevo mensaje",
    };

    const updatedChat = await Chat.findOneAndUpdate(
      { _id: req.params.chatId },
      { $push: { messages: newMessage } },
      { new: true }
    );
    return res.status(200).send(updatedChat);
  } catch (error) {
    console.log(error);
    return res.status(500).send(error);
  }
});

export default router;
