const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    username: { type: String, required: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phoneNumber: { type: Number, required: true, unique: true },
    password: { type: String, required: true },
    settings: {
        notification: { type: Boolean, default: true },
        preferred_channel: { type: String, default: "Wi-Fi" }
    },
    devices: [
        {
            wifi_ip: { type: String },
            wifi_gateway: { type: String },
            ble_id: { type: String }
        }
    ],
    joinedTo: [{ type: mongoose.Schema.Types.ObjectId, ref: "Chat" }]
}, { timestamps: true });

const User = mongoose.model("User", userSchema);
module.exports = User;
