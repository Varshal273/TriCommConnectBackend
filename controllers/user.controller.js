const User = require("../models/user.model");
const Chat = require("../models/chat.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// Secret key for JWT authentication
const JWT_SECRET = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI5NDI3NTgwODQ1IiwiaWF0IjoxNzQyOTg5NzM1LCJleHAiOjE3NDI5OTMzMzV9.tLVXZbcKUtjynUsZQV0BVBNNJrFY-6590RAJWGt9Wk8";

// 📌 **Create User (Register)**
exports.registerUser = async (req, res) => {
    try {
        const { username, name, email, phoneNumber, password } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: "User already exists" });

        // Hash the password before storing
        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            username, name, email, phoneNumber, password: hashedPassword
        });

        await newUser.save();
        res.status(201).json({ message: "User registered successfully" });

    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};

// 📌 **Login User**
exports.loginUser = async (req, res) => {
    try {
        // console.log("hello")
        // console.log(req.body)
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user) return res.status(400).json({ message: "Invalid email or password" });

        // Compare the hashed password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Invalid email or password" });

        // Generate JWT token
        const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: "7d" });

        res.status(200).json({ message: "Login successful", token, user });

    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};

// 📌 **Get User Profile**
exports.getUserProfile = async (req, res) => {
    try {
        const userId = req.user.userId; // Extracted from JWT in middleware
        const user = await User.findById(userId).select("-password");
        if (!user) return res.status(404).json({ message: "User not found" });

        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};

exports.getName = async (req, res)=>{
    try{
        const userId = req.user.userId;
        const Name = await User.findById(userId).select("+name");
        if (!Name) return res.status(404).json({message:"User's name not found!!"});

        res.status(200).json(Name);
    } catch(error){
        res.status(500).json({message:"Server Error in getName", error});
    }
};

// 📌 **Update Password**
exports.updatePassword = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { currentPassword, newPassword } = req.body;

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        // Check current password
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) return res.status(400).json({ message: "Incorrect current password" });

        // Hash new password
        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();

        res.status(200).json({ message: "Password updated successfully" });

    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};

// 📌 **Update User Settings**
exports.updateUserSettings = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { notification, preferred_channel } = req.body;

        const updatedUser = await User.findByIdAndUpdate(userId, {
            $set: { "settings.notification": notification, "settings.preferred_channel": preferred_channel }
        }, { new: true });

        if (!updatedUser) return res.status(404).json({ message: "User not found" });

        res.status(200).json(updatedUser);

    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};

// 📌 **Update Devices**
exports.updateDevices = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { wifi_ip, wifi_gateway, ble_id } = req.body;

        const updatedUser = await User.findByIdAndUpdate(userId, {
            $push: { devices: { wifi_ip, wifi_gateway, ble_id } }
        }, { new: true });

        if (!updatedUser) return res.status(404).json({ message: "User not found" });

        res.status(200).json(updatedUser);

    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};

// 📌 **Delete User (Account Deletion)**
exports.deleteUser = async (req, res) => {
    try {
        const userId = req.user.userId;
        await User.findByIdAndDelete(userId);
        res.status(200).json({ message: "User deleted successfully" });

    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};

// 📌 **Get List of All Users (Excluding Passwords)**
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select("username + name + email + phoneNumber"); // Exclude password from response
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};  

// const User = require('../models/User');
const mongoose = require('mongoose');

exports.getUserChats = async (req, res) => {
    try {
        const { userId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: "Invalid userId" });
        }

        const user = await User.findById(userId).select('joinedTo');

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const chats = await Chat.find({
            _id: { $in: user.joinedTo }
        }).select('groupName');

        const chatNames = chats.map(chat => chat.groupName);

        res.status(200).json({ chatNames });

    } catch (error) {
        console.error("Error getting user chats:", error);
        res.status(500).json({ error: "Failed to retrieve user chats." });
    }
};
