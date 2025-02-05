require("dotenv").config();
const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const connectDB = require("./config");
const authRoutes = require("./routes/authRoutes");
const chatRoutes = require("./routes/chatRoutes");

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/chat", chatRoutes);

const ChatMessage = require("./models/ChatMessage");

io.on("connection", (socket) => {
  console.log("New user connected:", socket.id);

  socket.on("joinRoom", async ({ username, room }) => {
    socket.join(room);
    io.to(room).emit("message", {
      from_user: "System",
      message: `${username} has joined the room`,
    });
  });

  socket.on("chatMessage", async ({ from_user, room, to_user, message }) => {
    try {
      const newMessage = new ChatMessage({ from_user, room, to_user, message });
      await newMessage.save();

      io.to(room).emit("message", { from_user, message });
    } catch (error) {
      console.error("Error saving message:", error);
    }
  });

  socket.on("typing", ({ username, room }) => {
    socket.to(room).emit("userTyping", { username, room });
  });

  socket.on("disconnect", () => {
    console.log(`User ${socket.id} disconnected`);
  });
});

const PORT = process.env.PORT || 5055;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
