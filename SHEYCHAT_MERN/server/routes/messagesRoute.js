const router = require("express").Router();
const Message = require("../models/messageModel");
const Chat = require("../models/chatModel");
const authMiddleware = require("../middlewares/authMiddleware");

// new messages

router.post("/new-message", async (req, res) => {
  try {
    // store message
    const newMessage = new Message(req.body);
    const savedMessage = await newMessage.save();

    // update last message of chat

    await Chat.findOneAndUpdate(
      { _id: req.body.chat },
      {
        lastMessage: savedMessage._id,
        $inc: { unreadMessages: 1 },  //increase unread nsg count
      }
    );
    res.send({
      success: true,
      message: "Message sent successfully",
      data: savedMessage,
    });
  } catch (error) {
    res.send({
      success: false,
      message: "Error sending message",
      data: error.message,
    });
  }
});

// get all messages of a chat

router.get("/get-all-messages/:chatId", async (req, res) => {
  try {
    const messages = await Message.find({
      chat: req.params.chatId,
    }).sort({ createAt: 1 });
    res.send({
      success: true,
      message: "Messages fetched successfully",
      data: messages,
    });
  } catch (error) {
    res.send({
      success: false,
      message: "Error fetching messages",
      error: error.message,
    });
  }
});

module.exports = router;
