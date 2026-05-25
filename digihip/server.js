const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");
const next = require("next");

const isProd = process.env.NODE_ENV === "production";
const app = next({ dev: !isProd });
const handle = app.getRequestHandler();

const port = process.env.PORT || 3001;

app.prepare().then(() => {
  const expressApp = express();
  const httpServer = createServer(expressApp);

  // Initialize WebSocket server only once and attach it to the global scope
  if (!global.io) {
    console.log("Initializing WebSocket server...");
    global.io = new Server(httpServer, {
      cors: {
        origin: isProd ? process.env.NEXTAUTH_URL : "*",
        methods: ["GET", "POST"],
        allowedHeaders: ["Content-Type"],
      },
    });

    // WebSocket connection event handling
    global.io.on("connection", (socket) => {
      console.log("Client connected");

      socket.on("disconnect", () => {
        console.log("Client disconnected");
      });
    });
  }

  // Handle all Next.js routes
  expressApp.all("*", (req, res) => handle(req, res));

  // Start the server
  httpServer.listen(port, () => {
    console.log(`Server listening on http://localhost:${port}`);
  });
});
