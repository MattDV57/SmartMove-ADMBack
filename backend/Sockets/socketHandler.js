const socketHandler = (io) => {
  io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    //TODO: Cliente - Crear Metodo "createRoom"
    //Deberia inicializar un Chat Model en Mongodb
    //Utilizar el id de este objeto como el id de la room

    //TODO: Soporte - El equipo de soporte sería el que usa el método "joinRoom"
    //Al unirse debería cargar los chats que el usuario ya mandó, asi los puede ver
    //O evitamos que el usuario pueda mandar chats hasta que se conecte uno de soporte???
    //Luego, los dos se comunican en el mismo room normalmente
    //Se puede agregar encriptación, verificacion de permisos
    //Funciones como exportar chat a mail serían a través de REST API

    // Join a room
    socket.on("joinChat", ({ username, chat }) => {
      console.log(chat);
      socket.join(chat);
      console.log(`${username} joined room: ${chat}`);
      // Broadcast to the room that a new user has joined
      socket.to(chat).emit("message", `${username} has joined the chat`);
    });

    // Handle sending messages to a room
    socket.on("chatMessage", (messageObject) => {
      const { body, from, chat } = messageObject;
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
