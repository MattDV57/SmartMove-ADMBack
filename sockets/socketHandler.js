import { Chat } from "../models/chatModel.js";
import { isValidObjectId } from "mongoose";
import { chatMessageHandler } from "./chatMessageHandler.js";

const socketHandler = (io) => {
  io.on("connection", (socket) => {
    //Funcion para crear un chat, usada por el usuario
    socket.on("createChat", async () => {
      const newChatHistory = await Chat.create({});
      const chatId = newChatHistory._id.toString();
      socket.emit("message", chatId);

      socket.join(chatId);
    });

    // Join a room
    socket.on("joinChat", async (chat) => {
      try {
        if (!isValidObjectId(chat)) {
          //ChatId is not a Mongo object Id, it doesnt exist
          socket.emit("message", "Not a valid room id for chatID: " + chat);
          return;
        }

        const isInChat = socket.rooms.has(chat);

        const chatFound = await Chat.findById(chat);

        socket.join(chat);

        //Test chat ID: 66f091b26118976325f929cd
        if (chatFound && chatFound.messages && chatFound.messages.length > 0) {
          chatFound.messages.map((message) => {
            socket.emit("message", message);
          });
        }
      } catch (error) {
        console.log(error);
      }
    });

    // Handle sending messages to a room
    socket.on("chatMessage", async (messageObject) => {
      await chatMessageHandler(io, socket, messageObject); // Use the extracted method
    });
    socket.on("disconnect", () => {
      console.log(` disconnected`);
    });

    socket.on("getLastMessage", async (getObject) => {
      const chat = await Chat.findById(getObject.chatId);
      if (chat) {
        const lastMessage = chat.messages[chat.messages.length - 1];
        if (lastMessage) {
          if (lastMessage.body != getObject.message.text) {
            if (!socket.rooms.has(getObject.chat)) {
              socket.join(getObject.chatId);
            }
            io.to(getObject.chatId).emit("message", lastMessage);
          } else {
          }
        }
      }
    });
  });
};

export default socketHandler;
