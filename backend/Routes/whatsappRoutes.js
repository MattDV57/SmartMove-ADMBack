import "dotenv/config.js";

import express from "express";
import axios from "axios";

const router = express.Router();

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

const sendWhatsAppMessage = async (message) => {
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
        to: "541136178420",
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
    const response = await sendWhatsAppMessage(req.body.message);

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
    let body = req.body;

    console.log(body.entry[0].changes[0].value);

    if (body.object) {
      if (body.entry && body.entry[0] && body.entry[0].changes[0].value) {
        let bodyData = body.entry[0].changes[0].value;
        let phoneNumber = bodyData.messages[0].from;
        let message = bodyData.messages[0].text.body;

        console.log(message);
        console.log(phoneNumber);
        await sendWhatsAppMessage(
          "Acabas de decir: " + message + " y tu número es: " + phoneNumber
        );
      }
    }
    res.status(200).send();
  } catch (error) {
    console.log(error);
    return res.status(500).send({ message: "Error on server side" });
  }
});

export default router;
