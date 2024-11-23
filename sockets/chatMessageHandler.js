import { Chat } from "../models/chatModel.js";
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
