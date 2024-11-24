import "dotenv/config";

import express from "express";
import axios from "axios";

import { Claim } from "../models/claimModel.js";
import { Chat } from "../models/chatModel.js";
import getTemplateByCode from "../utils/templateHandler.js";
import { chatMessageHandler } from "../sockets/chatMessageHandler.js";
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
      if (reqBody.entry[0].changes[0].value) {
        //TEMPLATE PATH
        if (reqBody.entry[0].changes[0].value.messages[0].type == "button") {
          if (
            req.body.entry[0].changes[0].value.messages[0].from !=
            process.env.TEST_PHONE_NUMBER
          ) {
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

            if (messageToSend == "chat_en_vivo") {
              const createdClaim = await createUserLiveChat(phoneNumber);
            } else if (messageToSend == "terminar_chat") {
              const closedClaim = await closeUserActiveClaim(phoneNumber);
            }
            const response = await sendWhatsAppTemplate(
              messageToSend,
              phoneNumber
            );
          }
        } else if (
          req.body.entry[0].changes[0].value.messages[0].from !=
          process.env.TEST_PHONE_NUMBER
        ) {
          let phoneNumber = req.body.entry[0].changes[0].value.messages[0].from;
          if (phoneNumber.startsWith("549")) {
            phoneNumber = phoneNumber.replace(/^\d{3}/, "54");
          }
          let message =
            req.body.entry[0].changes[0].value.messages[0].text.body;

          const foundClaim = await findUserActiveClaim(phoneNumber);

          if (foundClaim == null && message == "Hola") {
            const response = await sendWhatsAppTemplate(
              "menu_original_with_live_chat",
              phoneNumber
            );
          } else if (foundClaim != null) {
            const messageObject = {
              from: "wppUser",
              body: message,
              sender: "wppUser",
            };

            const updatedChat = await Chat.findOneAndUpdate(
              { _id: foundClaim.relatedChat },
              { $push: { messages: messageObject } },
              { new: true, useFindAndModify: false }
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
    return templateCode;
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
      category: "WhatsApp",
      status: { $ne: "Cerrado" },
    });

    if (foundClaim) {
      return foundClaim;
    }

    return null;
  } catch (error) {
    console.log(error);
    return null;
  }
};

const closeUserActiveClaim = async (userPhoneNumber) => {
  const updatedClaim = await Claim.findOneAndUpdate(
    {
      "user.userPhoneNumber": userPhoneNumber,
      status: { $ne: "Cerrado" },
      category: "WhatsApp",
    },
    { $set: { status: "Cerrado" } }, // Update operation to set status to "Cerrado"
    { new: true } // Option to return the updated document
  );
  return updatedClaim;
};

export default router;
