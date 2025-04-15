const express = require("express");
const router = express.Router();
const chatController = require("../controllers/chat.controller");
// const userController = require('../controllers/user.controllers');
const authMiddleware = require("../middleware/auth.middleware");

// router.post("/create", chatController.createChat);
// router.get("/:chatId", chatController.getMessages);
router.post("/:chatId/send", chatController.sendMessage);
router.put("/:chatId/add-user", chatController.addUserToGroup);
router.put("/:chatId/remove-user", chatController.removeUserFromGroup);
router.put("/:chatId/update-group-name", chatController.updateGroupName);
router.delete("/:chatId", chatController.deleteChat);
// Create new chat
router.post("/create", chatController.createChat);

// Send message
router.post("/:chatId/message", chatController.sendMessage);

// Get messages in chat
router.get("/:chatId/messages", chatController.getMessages);

// ✅ Get all chats for a user (sync for Android V2)
router.get("/user/:userId", chatController.getAllChatsForUser);
// Route: GET /api/users/getUserChats/:userId

module.exports = router;
