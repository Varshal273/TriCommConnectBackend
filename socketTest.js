const { io } = require("socket.io-client");

// ✅ Your backend socket server URL
const socket = io("http://localhost:5000", {
    transports: ["websocket"], // Important for correct connection
});

socket.on("connect", () => {
    console.log("✅ Connected as:", socket.id);

    // 1. JOIN ROOM
    const testChatId = "67fe07c7ce06e4a07d12f5fe";
    socket.emit("join_room", testChatId);
    console.log("📩 Joined room:", testChatId);

    // 2. SEND MESSAGE
    const testPayload = {
        chatId: testChatId,
        senderId: "67e3fca4f659e9d28448e851",
        msgBody: "Hello from Socket test!"
    };

    socket.emit("send_message", testPayload);
    console.log("📨 Sent message:", testPayload);
});

// 3. RECEIVE MESSAGE
socket.on("receive_message", (data) => {
    console.log("📥 Received message from server:");
    console.log(data);
});

// 4. Error handling
socket.on("error", (err) => {
    console.error("❌ Error from server:", err);
});

socket.on("disconnect", () => {
    console.log("❌ Disconnected");
});
