let io;

//init is just defining a function
module.exports = {
  init: (httpServer) => {
    io = require("socket.io")(httpServer, {
      cors: { origin: "http://localhost:8080" },
    });
    return io;
  },
  getIO: () => {
    if (!io) {
      throw new Error("Socket.io not initialized");
    }
    return io;
  },
};
