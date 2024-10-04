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

router.post("/webhook", async (req, res) => {
  try {
    console.log(req.body);
    res.status(200).send();
  } catch (error) {
    console.log(error);
    return res.status(500).send({ message: "Error on server side" });
  }
});

export default router;
