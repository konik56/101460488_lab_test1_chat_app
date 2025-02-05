const express = require("express");
const router = express.Router();
const ChatMessage = require("../models/ChatMessage");

router.get("/room/:room", async (req, res) => {
  try {
    const messages = await ChatMessage.find({ room: req.params.room }).sort({
      date_sent: 1,
    });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving messages" });
  }
});

router.get("/messages/:room", async (req, res) => {
  try {
    const room = req.params.room;
    const messages = await ChatMessage.find({ room }).sort({ createdAt: 1 });
    res.json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ message: "Error fetching messages" });
  }
});

module.exports = router;
