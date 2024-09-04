import express from "express";
import { Chat } from "../Models/chatModel.js";

const router = express.Router();

//Se pueden pasar las funciones a un "controller" o "service" si se quiere
//Es temporal esto de hacer las operaciones en las rutas
//TODO: Agregar hacer catch de errores
//TODO: Mejores mensajes de errores

router.post("/", async (req, res) => {
  console.log(req.body);
  const newChat = {
    date: req.body.date,
    title: req.body.title,
    messages: req.body.messages,
  };

  const chat = await Chat.create(newChat);
  return res.status(200).send(chat);
});

router.get("/:chatId", async (req, res) => {
  const foundChat = await Chat.findOne({ _id: req.params.chatId });
  return res.status(200).send(foundChat);
});

router.put("/:chatId", async (req, res) => {
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
});

export default router;
