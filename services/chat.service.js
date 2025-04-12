const Chat = require("../models/chat.model");

// 📌 Create a new chat (1-on-1 or group)
const createChat = async (userIds, groupName = null) => {
    try {
        const chat = new Chat({
            group: userIds,
            msg: [],
            groupName: groupName || userIds.join("_"), // Default name if not provided
        });

        await chat.save();
        return chat;
    } catch (error) {
        throw new Error("Error creating chat: " + error.message);
    }
};

// 📌 Get chat details by ID
const getChatById = async (chatId) => {
    try {
        return await Chat.findById(chatId).populate("group", "username email");
    } catch (error) {
        throw new Error("Chat not found: " + error.message);
    }
};

// 📌 Get all chats for a user
const getChatsForUser = async (userId) => {
    try {
        return await Chat.find({ group: userId }).populate("group", "username email");
    } catch (error) {
        throw new Error("Error fetching chats: " + error.message);
    }
};

// 📌 Add a message to a chat
const addMessageToChat = async (chatId, senderUserId, msgBody) => {
    try {
        const chat = await Chat.findById(chatId);
        if (!chat) throw new Error("Chat not found");

        const message = {
            senderUserId,
            msgBody,
            time: new Date(),
        };

        chat.msg.push(message);
        await chat.save();
        return message;
    } catch (error) {
        throw new Error("Error sending message: " + error.message);
    }
};

// 📌 Update a chat (e.g., group name, members)
const updateChat = async (chatId, updateData) => {
    try {
        return await Chat.findByIdAndUpdate(chatId, updateData, { new: true });
    } catch (error) {
        throw new Error("Error updating chat: " + error.message);
    }
};

// 📌 Delete a chat
const deleteChat = async (chatId) => {
    try {
        return await Chat.findByIdAndDelete(chatId);
    } catch (error) {
        throw new Error("Error deleting chat: " + error.message);
    }
};

module.exports = {
    createChat,
    getChatById,
    getChatsForUser,
    addMessageToChat,
    updateChat,
    deleteChat,
};
