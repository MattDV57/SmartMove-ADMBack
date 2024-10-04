import "dotenv/config.js";

import express from "express";
import axios from "axios";

import { Claim } from "../Models/claimModel.js";
import { Chat } from "../Models/chatModel.js";

const router = express.Router();

const baseClaimBody = {};

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
    console.log("ERROR HAPPENED");
    console.log("EEROR TIME: ", new Date());
    console.log(error);
    return error;
  }
};

router.post("/send-message", async (req, res) => {
  try {
    const response = await sendWhatsAppMessage(
      req.body.message,
      req.body.phone
    );

    return res.status(200).send(response.data);
  } catch (error) {
    console.log("ERROR HAPPENED");
    console.log("EEROR TIME: ", new Date());
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
    if (req.body.object === "whatsapp_business_account") {
      if (req.body.entry[0].changes[0].value.messages) {
        console.log(req.body.entry[0].changes[0]);
        let phoneNumber = req.body.entry[0].changes[0].value.messages[0].from;
        console.log(phoneNumber);
        let message = req.body.entry[0].changes[0].value.messages[0].text.body;
        await sendWhatsAppMessage(
          "Acabas de decir: " + message + " y tu número es: " + phoneNumber,
          phoneNumber
        );
      }
    } else {
      let messagesBody = req.body.value.messages;
      console.log(messagesBody);
      if (messagesBody) {
        let phoneNumber = messagesBody[0].from;
        console.log(phoneNumber);
        let message = messagesBody[0].text.body;

        console.log(message);
        console.log(phoneNumber);
        await sendWhatsAppMessage(
          "Acabas de decir: " + message + " y tu número es: " + phoneNumber,
          phoneNumber
        );
      }
    }
    res.status(200).send();
  } catch (error) {
    console.log(error);
    return res.status(500).send({ message: "Error on server side" });
  }
});

const messageFlow = async (userMessage, userPhoneNumber) => {
  //Realizar flujo de comunicacion
  //1. Recibir mensaje con el comando "crear; reclamo; ayuda"
  //1.1 Crear objeto Chat y un objeto Claim
  //1.1.1 Asignar Chat al Claim
  //2 Cada mensaje de ese numero se guarda en el chat
  //3. Ir actualizando el reclamo con lo que dice en el chat? ("descripcion; category; subject")
  //3.1 Obtener descripcion:
};

const findUserActiveClaim = async (userPhoneNumber) => {
  try {
    const foundClaim = await Claim.findOne({
      "user.userPhoneNumber": userPhoneNumber,
      status: { $ne: "Cerrado" },
    });

    console.log("FOUND CLAIM: ", foundClaim);

    if (foundClaim) {
      return foundClaim;
    }

    //Si no tiene un reclamo activo el numero de telefono asociado, crea uno
    const createdClaim = await Claim.create({});
    return createdClaim;
  } catch (error) {
    console.log(error);
    return false;
  }
};

export default router;
