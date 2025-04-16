const socketIO = require("socket.io");
const Chat = require("../models/chat.model");
const User = require("../models/user.model");

let io;

const initializeSocket = (server) => {
    io = socketIO(server, {
        cors: {
            origin: "*", // Replace with frontend URL in production
            methods: ["GET", "POST"]
        }
    });

    io.on("connection", (socket) => {
        console.log("🔌 A user connected:", socket.id);

        // 🔄 Join chat room
        socket.on("join_room", (chatId) => {
            socket.join(chatId);
            console.log(`📩 User joined chat room: ${chatId}`);
        });

        // ✉️ Send message
        socket.on("send_message", async ({ chatId, senderId, msgBody }) => {
            try {
                const chat = await Chat.findById(chatId);
                const senderUser = await User.findById(senderId).select("_id username");

                if (!chat || !senderUser) {
                    return socket.emit("error", { message: "Invalid chat or sender." });
                }

                const newMessage = {
                    senderUserId: senderUser._id,
                    msgBody,
                    time: new Date()
                };

                // Push to chat and save
                chat.msg.push(newMessage);
                await chat.save();

                // Populate the last added message with _id and full sender info
                const populatedMessage = {
                    _id: chat.msg[chat.msg.length - 1]._id,
                    senderUserId: senderUser,
                    msgBody: newMessage.msgBody,
                    time: newMessage.time
                };

                // Broadcast to all users in the room
                io.to(chatId).emit("receive_message", populatedMessage);
                console.log("📨 Message sent in chat:", chatId);
            } catch (error) {
                console.error("❌ Error in send_message:", error);
                socket.emit("error", { message: "Message send failed." });
            }
        });

        // ❌ Disconnect
        socket.on("disconnect", () => {
            console.log("❌ User disconnected:", socket.id);
        });
    });

    return io;
};

const getIO = () => {
    if (!io) {
        throw new Error("Socket.io not initialized!");
    }
    return io;
};

module.exports = { initializeSocket, getIO };

// const socketIO = require("socket.io");
// const Chat = require("../models/chat.model");

// let io;

// const initializeSocket = (server) => {
//     io = socketIO(server, {
//         cors: {
//             origin: "*", // Adjust this to your frontend URL
//             methods: ["GET", "POST"]
//         }
//     });

//     io.on("connection", (socket) => {
//         console.log("🔌 A user connected:", socket.id);

//         // Join a chat room
//         socket.on("join_room", (chatId) => {
//             socket.join(chatId);
//             console.log(`📩 User joined chat: ${chatId}`);
//         });

//         // Handle sending messages
//         socket.on("send_message", async ({ chatId, senderId, msgBody }) => {
//             try {
//                 const chat = await Chat.findById(chatId);
//                 if (!chat) {
//                     return socket.emit("error", { message: "Chat not found." });
//                 }

//                 const newMessage = { SenderUserId: senderId, msgBody, Time: new Date() };
//                 chat.msg.push(newMessage);
//                 await chat.save();

//                 io.to(chatId).emit("receive_message", newMessage);
//                 console.log("📨 Message sent in chat:", chatId);
//             } catch (error) {
//                 console.error("❌ Error sending message:", error);
//             }
//         });

//         // Handle disconnect
//         socket.on("disconnect", () => {
//             console.log("❌ A user disconnected:", socket.id);
//         });
//     });

//     return io;
// };

// const getIO = () => {
//     if (!io) {
//         throw new Error("Socket.io has not been initialized!");
//     }
//     return io;
// };

// module.exports = { initializeSocket, getIO };
