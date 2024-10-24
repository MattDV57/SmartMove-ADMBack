import "dotenv/config";

import express from "express";
import axios from "axios";

import { Claim } from "../Models/claimModel.js";
import { Chat } from "../Models/chatModel.js";

const router = express.Router();

const baseClaimBody = {};

//Array para chequear si el comando ingresado existe
const messageTemplateCodeWords = [
  //Funcionalidad
  "Volver a menú",
  "Terminar el chat",

  //Botones de reclamo
  "Generar un reclamo",
  "Problema con alquiler",
  "Problema con dueño",
  "Maltrato",
  "Intento de estafa",
  "Oferta engañosa",
  "Problema con pagos",
  "Pago no recibido",
  "No puedo enviar pago",
  "Queja",
  "Mal servicio",
  "Mal soporte",
  "Mala experiencia",

  //Botones de soporte técnico
  "Soporte técnico",
  "No puedo registrarme",
  "No puedo ingresar",
  "Sitio web no funciona",
];

//

/*
messaging_product: "whatsapp",
        to: `${process.env.TEST_PHONE_NUMBER}`,
        type: "template",
        template: {
          name: "hello_world",
          language: {
            code: "en_US",
          },
        },
      },
      */

const sendWhatsAppMessage = async (message, phone) => {
  try {
    const response = await axios({
      url: `https://graph.facebook.com/v20.0/${process.env.WHATSAPP_PHONE_ID}/messages`,
      method: "post",
      headers: {
        Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
        "Content-Type": "application/json",
      },
      data: {
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: phone,
        type: "text",
        text: {
          preview_url: false,
          body: message.toString(),
        },
      },
    });
    return response;
  } catch (error) {
    console.log(error);
    return error;
  }
};

router.post("/send-message", async (req, res) => {
  try {
    let phone = req.body.phone;
    let newPhone = phone;
    if (phone.startsWith("549")) {
      newPhone = phone.replace(/^\d{3}/, "54");
    }

    const response = await sendWhatsAppMessage(req.body.message, newPhone);

    return res.status(200).send(response.data);
  } catch (error) {
    console.log(error);
    return res.status(500).send(error);
  }
});

router.get("/webhook", async (req, res) => {
  let mode = req.query["hub.mode"];
  let token = req.query["hub.verify_token"];
  let challenge = req.query["hub.challenge"];

  console.log("MODE: ", mode);
  console.log("TOKEN: ", token);
  console.log("CHALLENGE: ", challenge);

  if (mode && token) {
    if (mode === "subscribe" && token === process.env.WHATSAPP_VERIFY_TOKEN) {
      console.log("WEBHOOK_VERIFIED");
      res.status(200).send(challenge);
    } else {
      res.sendStatus(403);
    }
  }
});

router.post("/webhook", async (req, res) => {
  try {
    const reqBody = req.body;

    if (reqBody.object) {
      if (reqBody.entry[0].changes[0].value) {
        let phoneNumber = req.body.entry[0].changes[0].value.messages[0].from;
        if (phoneNumber.startsWith("549")) {
          phoneNumber = phoneNumber.replace(/^\d{3}/, "54");
        }
        let message = req.body.entry[0].changes[0].value.messages[0].text.body;
        const messageToSend = await messageFlow(message, phoneNumber);
        await sendWhatsAppMessage(messageToSend, phoneNumber);
      }
    } else {
      let messagesBody = req.body.value.messages;
      if (messagesBody) {
        let phoneNumber = messagesBody[0].from;
        if (phoneNumber.startsWith("549")) {
          phoneNumber = phoneNumber.replace(/^\d{3}/, "54");
        }
        let message = messagesBody[0].text.body;

        const messageToSend = await messageFlow(message, phoneNumber);
        await sendWhatsAppMessage(messageToSend, phoneNumber);
      }
    }
    res.status(200).send();
  } catch (error) {
    console.log(error);
    return res.status(500).send({ message: "Error on server side" });
  }
});

const messageFlow = async (userMessage, userPhoneNumber) => {
  try {
    const foundClaim = await findUserActiveClaim(userPhoneNumber);

    //Caso 1: El consulta es nuevo
    if (!foundClaim.description) {
      foundClaim.description = userMessage;
      const updatedClaim = await Claim.findOneAndUpdate(
        { _id: foundClaim._id },
        { description: userMessage },
        { new: true }
      );

      return "Bienvenido a SmartMove! 😊\nPor favor, escribinos tu consulta y te responderemos a la brevedad.";
    }

    //Caso 3: Cerrar consulta
    if (
      userMessage.toLowerCase().includes("cerrar consulta") ||
      userMessage.toLowerCase().includes("cerrar la consulta") ||
      userMessage.toLowerCase().includes("cerrar mi consulta")
    ) {
      const userMessageBody = {
        from: userPhoneNumber,
        body: userMessage,
      };

      const updatedChat = await Chat.findOneAndUpdate(
        { _id: foundClaim.relatedChat }, // Find the chat document by its ObjectId
        { $push: { messages: userMessageBody } }, // Push the new message into the messages array
        { new: true, useFindAndModify: false } // Return the updated document after the update
      );

      const updatedClaim = await Claim.findOneAndUpdate(
        { _id: foundClaim._id },
        { status: "Cerrado" },
        { new: true }
      );
      return "Tu consulta ha sido cerrada. Gracias por comunicarte con nosotros.";
    }

    //Caso 2: Ya tenemos la descripcion del consulta
    if (foundClaim.description) {
      const userMessageBody = {
        from: userPhoneNumber,
        body: userMessage,
      };

      const updatedChat = await Chat.findOneAndUpdate(
        { _id: foundClaim.relatedChat }, // Find the chat document by its ObjectId
        { $push: { messages: userMessageBody } }, // Push the new message into the messages array
        { new: true, useFindAndModify: false } // Return the updated document after the update
      );

      return "Gracias por tu mensaje. Estamos trabajando en tu consulta. Por favor, si tienes más información para agregar, escríbenos.";
    }

    return "Actualmente no podemos procesar tu mensaje, por favor intenta más tarde";
    //Realizar flujo de comunicacion
    //1. Recibir mensaje con el comando "crear; consulta; ayuda"
    //1.1 Crear objeto Chat y un objeto Claim
    //1.1.1 Asignar Chat al Claim
    //2 Cada mensaje de ese numero se guarda en el chat
    //3. Ir actualizando el consulta con lo que dice en el chat? ("descripcion; category; subject")
    //3.1 Obtener descripcion:
  } catch (error) {
    console.log(error);
    return "Actualmente no podemos procesar tu mensaje, por favor intenta más tarde";
  }
};

const findUserActiveClaim = async (userPhoneNumber) => {
  try {
    const foundClaim = await Claim.findOne({
      "user.userPhoneNumber": userPhoneNumber,
      status: { $ne: "Cerrado" },
    });

    if (foundClaim) {
      return foundClaim;
    }

    //Si no tiene un consulta activo el numero de telefono asociado, crea uno

    const createdChat = await Chat.create({});
    const createdChatId = createdChat._id.toString();

    const createdClaim = await Claim.create({
      subject: "Consulta",
      "user.userPhoneNumber": userPhoneNumber,
      relatedChat: createdChatId,
    });
    return createdClaim;
  } catch (error) {
    console.log(error);
    return false;
  }
};

export default router;
