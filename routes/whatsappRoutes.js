import "dotenv/config";

import express from "express";
import axios from "axios";

import { Claim } from "../models/claimModel.js";
import { Chat } from "../models/chatModel.js";
import getTemplateByCode from "../utils/templateHandler.js";
import { AssignPublicIp } from "@aws-sdk/client-eventbridge";

const router = express.Router();

const baseClaimBody = {};

//Array para chequear si el comando ingresado existe

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
      url: `https://graph.facebook.com/v21.0/${process.env.WHATSAPP_PHONE_ID}/messages`,
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

const sendWhatsAppTemplate = async (templateCode, phone) => {
  const response = await axios({
    url: `https://graph.facebook.com/v21.0/${process.env.WHATSAPP_PHONE_ID}/messages`,
    method: "post",
    headers: {
      Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
      "Content-Type": "application/json",
    },
    data: {
      messaging_product: "whatsapp",
      to: phone,
      type: "template",
      template: {
        name: templateCode,
        language: {
          code: "es_AR",
        },
      },
    },
  });
  return response;
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
    return res.status(200).send(error);
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

router.post("/testTemplate", async (req, res) => {
  let response = await getTemplateByCode(req.body.code);
  return res.status(200).send(response);
});

router.post("/webhook", async (req, res) => {
  try {
    if (req.body.entry[0].changes[0].value.statuses != undefined) {
      return res.status(200).send();
    }

    const reqBody = req.body;
    let hasStatuses = false;
    if (reqBody.entry[0].changes[0].value.statuses != undefined) {
      hasStatuses = true;
    }
    if (reqBody.object && !hasStatuses) {
      console.log("First check");
      if (reqBody.entry[0].changes[0].value) {
        //TEMPLATE PATH
        console.log("Second Check");
        console.log("ENTIRE DATA: ", JSON.stringify(req.body));
        if (
          reqBody.entry[0].changes[0].value.messages[0].type.button != "button"
        ) {
          console.log("Third Check");
          if (
            req.body.entry[0].changes[0].value.messages[0].from !=
            process.env.TEST_PHONE_NUMBER
          ) {
            console.log("TEMPLATE PATH FROM USER");
            let phoneNumber =
              req.body.entry[0].changes[0].value.messages[0].from;
            if (phoneNumber.startsWith("549")) {
              phoneNumber = phoneNumber.replace(/^\d{3}/, "54");
            }
            let message =
              req.body.entry[0].changes[0].value.messages[0].button.text;
            const messageToSend = await messageFlowWithTemplate(
              message,
              phoneNumber
            );
            const response = await sendWhatsAppTemplate(
              messageToSend,
              phoneNumber
            );

            console.log("A TEMPLATE HAS BEEN SENT");
            /*if (messageToSend != null && messageToSend == "chat_en_vivo") {
              console.log("USING IO");
              const io = req.app.get("socketio");

              testMessage = {
                from: "user",
                body: "Un usuario quizo entrar al liveChat",
                sender: "user",
              };
              io.to("672e959b3ff1daf56af0e561").emit("message", testMessage);*/
            //672e959b3ff1daf56af0e561
          }
        } else if (
          req.body.entry[0].changes[0].value.messages[0].from !=
          process.env.TEST_PHONE_NUMBER
        ) {
          console.log("Fourth Check");
          let phoneNumber = req.body.entry[0].changes[0].value.messages[0].from;
          if (phoneNumber.startsWith("549")) {
            phoneNumber = phoneNumber.replace(/^\d{3}/, "54");
          }
          let message =
            req.body.entry[0].changes[0].value.messages[0].text.body;
          console.log("RECEIVING A NORMAL MESSAGE FROM USER: ", message);
          const messageToSend = await messageFlowWithTemplate(
            message,
            phoneNumber
          );
          if (messageToSend != null) {
            const response = await sendWhatsAppTemplate(
              messageToSend,
              phoneNumber
            );
          }
        }
      }
      //MESSAGE PATH
    }
    return res.status(200).send();
  } catch (error) {
    console.log(error);
    return res.status(200).send({ message: "Error on server side" });
  }
});

const messageFlowWithTemplate = async (userMessage, userPhoneNumber) => {
  try {
    const templateCode = await getTemplateByCode(userMessage);
    console.log("TEMPLATE CODE: ", templateCode);
    return templateCode;

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

const messageFlowWithLiveChat = async (req, userMessage, userPhoneNumber) => {};

const createUserLiveChat = async (userPhoneNumber) => {
  const foundClaim = await Claim.findOne({
    "user.userPhoneNumber": userPhoneNumber,
    status: { $ne: "Cerrado" },
    category: "WhatsApp",
  });
  if (foundClaim) {
    return;
  }
  //Crear un reclamo con un chat asociado
  //El reclamo será de prioridad: "Consulta"
  //El reclamo será de tipo: "Reclamo"
  //Descripción: "Consulta realizada por WhatsApp"
  //Assigned operator: admin

  const createdChat = await Chat.create({});
  const createdChatId = createdChat._id.toString();

  const createdClaim = await Claim.create({
    subject: "Consulta",
    priority: "Consulta",
    caseType: "Reclamo",
    "user.userPhoneNumber": userPhoneNumber,
    category: "WhatsApp",
    relatedChat: createdChatId,
    assignedOperator: "admin",
  });
  return createdClaim;
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
