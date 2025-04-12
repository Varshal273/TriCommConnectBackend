const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");
const authMiddleware = require("../middleware/auth.middleware");
console.log("Auth: ", authMiddleware)

// ✅ Register a new user
router.post("/register", userController.registerUser);

// ✅ Login user
router.post("/login",userController.loginUser);

// ✅ Get user profile
router.get("/profile", userController.getUserProfile);

// ✅ Get list of chats for a user
// router.get("/chats", userController.getUserChats);

//Get lsit of all users
router.get("/getAllUsers", userController.getAllUsers)
// ✅ Get user settings
// router.get("/settings", userController.getUserSettings);

// ✅ Update password
router.put("/update-password", userController.updatePassword);

// ✅ Update notification settings & preferred channel
router.put("/update-settings", userController.updateUserSettings);

// ✅ Update devices (add/remove)
// router.put("/update-devices", userController.updateUserDevices);

// ✅ Update joined chat groups
// router.put("/update-joined-chats", userController.updateUserJoinedChats);

// ✅ Delete user account
router.delete("/delete", userController.deleteUser);


router.get('/getUserChats/:userId', userController.getUserChats);

module.exports = router;
