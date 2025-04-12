const socketIO = require("socket.io");
const Chat = require("../models/chat.model");

let io;

const initializeSocket = (server) => {
    io = socketIO(server, {
        cors: {
            origin: "*", // Adjust this to your frontend URL
            methods: ["GET", "POST"]
        }
    });

    io.on("connection", (socket) => {
        console.log("🔌 A user connected:", socket.id);

        // Join a chat room
        socket.on("join_room", (chatId) => {
            socket.join(chatId);
            console.log(`📩 User joined chat: ${chatId}`);
        });

        // Handle sending messages
        socket.on("send_message", async ({ chatId, senderId, msgBody }) => {
            try {
                const chat = await Chat.findById(chatId);
                if (!chat) {
                    return socket.emit("error", { message: "Chat not found." });
                }

                const newMessage = { SenderUserId: senderId, msgBody, Time: new Date() };
                chat.msg.push(newMessage);
                await chat.save();

                io.to(chatId).emit("receive_message", newMessage);
                console.log("📨 Message sent in chat:", chatId);
            } catch (error) {
                console.error("❌ Error sending message:", error);
            }
        });

        // Handle disconnect
        socket.on("disconnect", () => {
            console.log("❌ A user disconnected:", socket.id);
        });
    });

    return io;
};

const getIO = () => {
    if (!io) {
        throw new Error("Socket.io has not been initialized!");
    }
    return io;
};

module.exports = { initializeSocket, getIO };
