const Chat = require("../models/chat.model");
const User = require("../models/user.model");
const mongoose = require('mongoose');
// const chatServices = require("../services/chat.service")

// ✅ Create a new chat (single or group)
exports.createChat = async (req, res) => {
    try {
        let { userIds, groupName } = req.body;

        if (!userIds || userIds.length < 2) {
            return res.status(400).json({ message: "At least two users are required." });
        }

        // Convert userIds to ObjectIds
        userIds = userIds.map(id => new mongoose.Types.ObjectId(id));

        // Validate that all user IDs exist
        const users = await User.find({ _id: { $in: userIds } });
        if (users.length !== userIds.length) {
            return res.status(400).json({ message: "Some user IDs are invalid or not found." });
        }

        // For group chats: groupName must be provided and unique
        if (userIds.length > 2) {
            if (!groupName || groupName.trim() === "") {
                return res.status(400).json({ message: "Group name is required for group chats." });
            }

            const nameExists = await Chat.findOne({ groupName });
            if (nameExists) {
                return res.status(400).json({ message: "Group name already exists. Please choose a different name." });
            }
        }

        // For 2-person chats, check if one already exists
        if (userIds.length === 2) {
            const existingChat = await Chat.findOne({
                group: { $size: 2, $all: userIds }
            });

            if (existingChat) {
                return res.status(200).json({ message: "Chat already exists", chat: existingChat });
            }

            // If no group name, set it using the name of the second user
            if (!groupName) {
                const otherUserId = userIds[1]; // assume second user for naming
                const otherUser = await User.findById(otherUserId);
                groupName = otherUser?.name || "Personal Chat";
            }
        }

        // Create new chat
        const newChat = new Chat({
            group: userIds,
            msg: [],
            groupName
        });

        await newChat.save();

        // Add chat to each user's joinedTo field
        await Promise.all(
            userIds.map(userId =>
                User.findByIdAndUpdate(
                    userId,
                    { $addToSet: { joinedTo: newChat._id } },
                    { new: true }
                )
            )
        );

        return res.status(201).json({ message: "Chat created", chat: newChat });

    } catch (error) {
        console.error("Error creating chat:", error);
        return res.status(500).json({ error: "Failed to create chat." });
    }
};



// ✅ Get messages of a chat
exports.getMessages = async (req, res) => {
    try {
        const chat = await Chat.findById(req.params.chatId);
        if (!chat) return res.status(404).json({ message: "Chat not found." });

        res.json(chat.msg);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch messages." });
    }
};

// ✅ Send a new message
exports.sendMessage = async (req, res) => {
    try {
        const { senderId, msgBody } = req.body;
        const chat = await Chat.findById(req.params.chatId);
        if (!chat) return res.status(404).json({ message: "Chat not found." });

        const newMessage = { SenderUserId: senderId, msgBody, Time: new Date() };
        chat.msg.push(newMessage);
        await chat.save();

        res.json({ message: "Message sent!", chat });
    } catch (error) {
        res.status(500).json({ error: "Failed to send message." });
    }
};

// ✅ Add user to group
exports.addUserToGroup = async (req, res) => {
    try {
        const { userId } = req.body;
        const chat = await Chat.findById(req.params.chatId);
        if (!chat) return res.status(404).json({ message: "Chat not found." });

        if (!chat.group.includes(userId)) {
            chat.group.push(userId);
            await chat.save();
        }

        res.json({ message: "User added!", chat });
    } catch (error) {
        res.status(500).json({ error: "Failed to add user." });
    }
};

// ✅ Remove user from group
exports.removeUserFromGroup = async (req, res) => {
    try {
        const { userId } = req.body;
        const chat = await Chat.findById(req.params.chatId);
        if (!chat) return res.status(404).json({ message: "Chat not found." });

        chat.group = chat.group.filter(id => id !== userId);
        await chat.save();

        res.json({ message: "User removed!", chat });
    } catch (error) {
        res.status(500).json({ error: "Failed to remove user." });
    }
};

// ✅ Update group name
exports.updateGroupName = async (req, res) => {
    try {
        const { newName } = req.body;
        const chat = await Chat.findById(req.params.chatId);
        if (!chat) return res.status(404).json({ message: "Chat not found." });

        chat.GroupName = newName;
        await chat.save();

        res.json({ message: "Group name updated!", chat });
    } catch (error) {
        res.status(500).json({ error: "Failed to update group name." });
    }
};

// ✅ Delete a chat
exports.deleteChat = async (req, res) => {
    try {
        await Chat.findByIdAndDelete(req.params.chatId);
        res.json({ message: "Chat deleted!" });
    } catch (error) {
        res.status(500).json({ error: "Failed to delete chat." });
    }
};
