import { Chat } from "../Models/chatModel.js";

const socketHandler = (io) => {
  io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

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

      console.log("Joining this chatId");
      socket.join(chatId);
      console.log(io.sockets.adapter.rooms);
      socket.emit("message", chatId);
    });

    // Join a room
    socket.on("joinChat", async (chat) => {
      const isInChat = socket.rooms.has(chat);
      console.log("Trying to join this" + chat);
      console.log("Is in this chat? " + isInChat);

      if (!isInChat) {
        console.log("Chat" + chat);
        socket.join(chat);

        // Broadcast to the room that a new user has joined
        io.to(chat).emit("message", `User has joined the chat`);
      }
    });

    // Handle sending messages to a room
    socket.on("chatMessage", async (messageObject) => {
      const { body, from, chat } = messageObject;
      await Chat.findOne({ _id: "66de1f778bdc5580219f5641" });
      if (chat) {
        io.to(chat).emit("message", `${from}: ${body}`);
      }
      console.log(messageObject);
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
