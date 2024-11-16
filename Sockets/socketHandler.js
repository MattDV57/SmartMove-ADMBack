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
      try {
        const { body, from, sender, chatId } = messageObject;
        if (!isValidObjectId(chatId)) {
          //ChatId is not a Mongo object Id, it doesnt exist
          return;
        }
        const newMessage = {
          from: from,
          body: body,
          sender: sender,
        };

        const chat = await Chat.findById(chatId);
        if (!chat || !chat.active) {
          return;
        }

        const updatedChat = await Chat.findOneAndUpdate(
          { _id: chatId }, // Find the chat document by its ObjectId
          { $push: { messages: newMessage } }, // Push the new message into the messages array
          { new: true, useFindAndModify: false } // Return the updated document after the update
        );

        if (updatedChat) {
          console.log(updatedChat);
          console.log(socket.rooms.has(chatId));
          socket.join(chatId);
          io.to(chatId).emit("message", newMessage);
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
