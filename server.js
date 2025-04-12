require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const http = require("http");
const cors = require("cors");
const morgan = require("morgan");
const errorHandler = require("./middleware/errorHandler");
const { initializeSocket } = require("./sockets/socketHandler");

// Import routes
const userRoutes = require("./routes/user.routes");
const chatRoutes = require("./routes/chat.routes");

const app = express();
const server = http.createServer(app);

// Initialize Socket.IO
initializeSocket(server);

// Middleware
app.use(express.json());
app.use(cors());
app.use(morgan("dev")); // Logs HTTP requests

// Routes
app.use("/api/users", userRoutes);
app.use("/api/chats", chatRoutes);

// Error Handling Middleware
app.use(errorHandler);

// MongoDB Connection
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/tricomm_connect";
mongoose
    .connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("✅ MongoDB Connected!"))
    .catch((err) => console.error("❌ MongoDB Connection Error:", err));

// Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
