import { Chat } from "../models/chatModel.js";
import { Claim } from "../models/claimModel.js";
import { sendWhatsAppMessage } from "./sendMessageToWPP.js";
import { isValidObjectId } from "mongoose";

export const chatMessageHandler = async (io, socket, messageObject) => {
  try {
    const { body, from, sender, chatId } = messageObject;

    if (!isValidObjectId(chatId)) {
      console.log("Invalid chat ID");
      return;
    }

    const newMessage = {
      from: from,
      body: body,
      sender: sender,
    };

    const claim = await Claim.findOne({ relatedChat: chatId });
    if (claim) {
      console.log("CLAIM FOUND");
      if (claim.category == "WhatsApp") {
        console.log("CLAIM CATEGORY IS WHATSAPP");
        const phone = claim.user.userPhoneNumber;
        await sendWhatsAppMessage(body, phone);
      } else {
        console.log("CLAIM CATEGORY IS NOT WHATSAPP");
      }
    }

    const chat = await Chat.findById(chatId);

    if (!chat || !chat.active) {
      console.log("Chat not found or inactive");
      return;
    }

    const updatedChat = await Chat.findOneAndUpdate(
      { _id: chatId },
      { $push: { messages: newMessage } },
      { new: true, useFindAndModify: false }
    );

    if (updatedChat) {
      console.log(updatedChat);
      if (!socket.rooms.has(chatId)) {
        socket.join(chatId);
      }
      io.to(chatId).emit("message", newMessage);
    }
  } catch (error) {
    console.log(error);
  }
};
