const webSocketServer = require("websocket").server;
const webSocketServerPort = 1337;
const http = require("http");
// Spinning the http server and the websocket server.
const server = http.createServer();
server.listen(webSocketServerPort);
console.log("listening on port " + webSocketServerPort);
const wsServer = new webSocketServer({
  httpServer: server,
});

const clients = {};

// This code generates unique userid for everyuser.

const getUniqueID = () => {
  const s4 = () => {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  };
  return s4() + s4() + "-" + s4();
};

wsServer.on("request", function (request) {
  let userID = getUniqueID();
  console.log(
    new Date() +
      " Recieved a new connection from origin " +
      request.origin +
      "."
  );
  const connection = request.accept(null, request.origin);
  clients[userID] = connection;
  console.log(
    "connected: " + userID + " in " + Object.getOwnPropertyNames(clients)
  );

  connection.on("message", function (message) {
    if (message.type === "utf8") {
      console.log("Received Message: " + message.utf8Data);
      for (key in clients) {
        clients[key].sendUTF(message.utf8Data);
        console.log("sent Message to: " + key);
      }
    }
  });

  connection.on("close", function (connection) {
    console.log(
      new Date() + " Peer " + connection.remoteAddress + " disconnected."
    );
    delete clients[userID];
  });
});
