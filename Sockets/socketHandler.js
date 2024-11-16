import { Chat } from "../Models/chatModel.js";
import { isValidObjectId } from "mongoose";

const socketHandler = (io) => {
  io.on("connection", (socket) => {
    //TODO: Cliente - Crear Metodo "createRoom"
    //Deberia inicializar un Chat Model en Mongodb
    //Utilizar el id de este objeto como el id de la room

    //TODO: Soporte - El equipo de soporte sería el que usa el método "joinChat"
    //Al unirse debería cargar los chats que el usuario ya mandó, asi los puede ver
    //O evitamos que el usuario pueda mandar chats hasta que se conecte uno de soporte???
    //Luego, los dos se comunican en el mismo room normalmente
    //Se puede agregar encriptación, verificacion de permisos
    //Funciones como exportar chat a mail serían a través de REST API

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
        console.log("Is in chat: ", chat);
        console.log(isInChat);

        const chatFound = await Chat.findById(chat);

        socket.join(chat);
        console.log("Is in chat: ", chat);
        console.log(socket.rooms.has(chat));

        //Test chat ID: 66f091b26118976325f929cd
        if (chatFound && chatFound.messages && chatFound.messages.length > 0) {
          console.log("Chat found: ", chatFound.messages.length);
          console.log("IS USER IN CHAT:", socket.rooms.has(chat));
          chatFound.messages.map((message) => {
            socket.emit("message", `${message.from}: ${message.body}`);
          });
        }
      } catch (error) {
        console.log(error);
      }
    });

    // Handle sending messages to a room
    socket.on("chatMessage", async (messageObject) => {
      try {
        const { body, from, chatId } = messageObject;
        if (!isValidObjectId(chatId)) {
          //ChatId is not a Mongo object Id, it doesnt exist
          return;
        }
        const newMessage = {
          from: from,
          body: body,
        };

        console.log("Received message: ", newMessage);
        console.log("From:", from);
        console.log("Chat ID:", chatId);

        const chat = await Chat.findById(chatId);
        if (!chat || !chat.active) {
          console.log("CHAT FOUND: ", chat);
          console.log("IS ACTIVE:", chat.active);
          return;
        }

        console.log("CHAT FOUND: ", chat);
        console.log("IS ACTIVE:", chat.active);

        const updatedChat = await Chat.findOneAndUpdate(
          { _id: chatId }, // Find the chat document by its ObjectId
          { $push: { messages: newMessage } }, // Push the new message into the messages array
          { new: true, useFindAndModify: false } // Return the updated document after the update
        );

        if (updatedChat) {
          console.log(updatedChat);
          console.log(socket.rooms.has(chatId));
          socket.join(chatId);
          io.to(chatId).emit("message", `${from}: ${body}`);
        }
      } catch (error) {
        console.log(error);
      }
    });

    // Handle user disconnection
    //Por ahora solo envía un mensaje, pero podríamos mandar como un mensaje de Template
    //Si te ha servido la experiencia, comentanos y blah blah blah
    //E informar también de la opción de exportar chat a mail si la hacemos
    socket.on("disconnect", () => {
      console.log(` disconnected`);
    });
  });
};

export default socketHandler;
