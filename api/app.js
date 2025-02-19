const express = require("express");
const fs = require("fs");
const http = require("http"); // Replaced https
const os = require("os");
const path = require("path");
const socketIo = require("socket.io");
// Remove unused SSL modules
// const selfsigned = require("selfsigned");
// const constants = require("constants");

const app = express();

// Serve static files from the 'static' folder
app.use(express.static(path.join(__dirname, "static")));

// Configure views directory (assuming HTML templates)
app.set("views", path.join(__dirname, "templates"));

// Rooms storage; each room stores a broadcaster and a Set of viewers
const rooms = {};

// Helper: Get IP addresses (non-loopback)
function getIPAddresses() {
  const interfaces = os.networkInterfaces();
  const ips = [];
  for (let name in interfaces) {
    for (let iface of interfaces[name]) {
      if (iface.family === "IPv4" && !iface.internal) {
        ips.push(iface.address);
      }
    }
  }
  return ips;
}

// Routes
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "templates", "index.html"));
});

app.get("/broadcast", (req, res) => {
  res.sendFile(path.join(__dirname, "templates", "broadcast.html"));
});

app.get("/view", (req, res) => {
  res.sendFile(path.join(__dirname, "templates", "view.html"));
});

app.get("/check", (req, res) => {
  res.send("Server is running!");
});

// Remove SSL certificate generation function and related code
// function getSSLOptions() { ... }
// const sslOptions = getSSLOptions();
// const httpsServer = https.createServer(sslOptions, app);

// Create an HTTP server instead
const server = http.createServer(app);

// Configure Socket.IO on the HTTP server
const io = socketIo(server, {
  cors: {
    origin: "*",
  },
  pingTimeout: 60000,
  pingInterval: 25000,
  maxHttpBufferSize: 1e8,
});

// Socket.IO event handlers
io.on("connection", (socket) => {
  console.log(`Client connected: ${socket.id}`);

  // ---------- BROADCAST CODE ----------
  socket.on("create", (data) => {
    const room = data.room;
    if (room) {
      rooms[room] = { broadcaster: socket.id, viewers: new Set() };
      socket.join(room);
      console.log(`Room ${room} created by ${socket.id}`);
      socket.emit("room_created", { room });
    }
  });

  // ---------- VIEW CODE ----------
  socket.on("join", (data) => {
    const room = data.room;
    if (!rooms[room]) {
      socket.emit("room_error", { message: "Room does not exist" });
      return;
    }
    socket.join(room);
    rooms[room].viewers.add(socket.id);
    console.log(`Viewer ${socket.id} joined room ${room}`);
    io.to(rooms[room].broadcaster).emit("viewer_joined", { viewer_id: socket.id });
  });

  // ---------- COMMON CODE ----------
  socket.on("offer", (data) => {
    const { room, offer, viewer_id } = data;
    if (rooms[room] && offer) {
      console.log(`Sending offer to viewer ${viewer_id} in room ${room}`);
      io.to(viewer_id).emit("offer", { offer });
    }
  });

  socket.on("answer", (data) => {
    const { room, answer } = data;
    if (rooms[room] && answer) {
      console.log(`Sending answer to broadcaster in room ${room}`);
      io.to(rooms[room].broadcaster).emit("answer", { answer, viewer_id: socket.id });
    }
  });

  socket.on("ice_candidate", (data) => {
    const { room, candidate } = data;
    if (rooms[room] && candidate) {
      if (socket.id === rooms[room].broadcaster) {
        const viewer_id = data.viewer_id;
        io.to(viewer_id).emit("ice_candidate", { candidate });
      } else {
        io.to(rooms[room].broadcaster).emit("ice_candidate", { candidate, viewer_id: socket.id });
      }
    }
  });

  socket.on("disconnect", () => {
    console.log(`Client disconnected: ${socket.id}`);
    // Remove disconnected broadcaster from rooms
    Object.keys(rooms).forEach((roomId) => {
      const roomInfo = rooms[roomId];
      if (roomInfo.broadcaster === socket.id) {
        delete rooms[roomId];
        io.to(roomId).emit("broadcaster_left", { room: roomId });
      }
    });
  });

  socket.on("error", (err) => {
    console.error(`Socket.IO Error: ${err}`);
  });
});

// Replace httpsServer.listen with server.listen and update log messages
server.listen(5000, () => {
  console.log("Server is running on: http://localhost:5000");
  const ips = (function getIPAddresses() {
    const interfaces = os.networkInterfaces();
    const ips = [];
    for (let name in interfaces) {
      for (let iface of interfaces[name]) {
        if (iface.family === "IPv4" && !iface.internal) {
          ips.push(iface.address);
        }
      }
    }
    return ips;
  })();
  ips.forEach((ip) => {
    console.log(`Accessible on LAN: http://${ip}:5000`);
  });
  // ...existing troubleshooting logs...
  console.log("\nTroubleshooting steps if devices can't connect:");
  console.log("1. Make sure all devices are on the same network");
  console.log("2. Try different IP addresses from above if one doesn't work");
  console.log("3. Accept the security certificate warning on each device");
  console.log("4. Check if your firewall is blocking port 5000");
  console.log("5. Try accessing /check route to verify server connection");
});
