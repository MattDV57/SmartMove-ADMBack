import express from "express";
import { Chat } from "../Models/chatModel.js";
import { Claim } from "../Models/claimModel.js";

const router = express.Router();

//Se pueden pasar las funciones a un "controller" o "service" si se quiere
//Es temporal esto de hacer las operaciones en las rutas
//TODO: Agregar hacer catch de errores
//TODO: Mejores mensajes de errores

router.get("/:chatId", async (req, res) => {
  const foundChat = await Chat.findOne({ _id: req.params.chatId });
  return res.status(200).send(foundChat);
});

router.post("/claim", async (req, res) => {
  const createdClaim = await Claim.create({});
  return res.status(200).send(createdClaim);
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
