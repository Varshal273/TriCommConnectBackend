const User = require("../models/user.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// 🔹 Create a new user (Register)
exports.createUser = async (userData) => {
    const { username, name, email, phoneNumber, password } = userData;

    // Check if email or phone number already exists
    const existingUser = await User.findOne({ $or: [{ email }, { phoneNumber }] });
    if (existingUser) {
        throw new Error("Email or Phone number already in use.");
    }

    // Hash password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = new User({
        username,
        name,
        email,
        phoneNumber,
        password: hashedPassword,
        settings: { notifications: true, preferred_channel: "Wi-Fi" }, // Default settings
        devices: [],
        joinedTo: [],
    });

    await newUser.save();
    return newUser;
};

// 🔹 Authenticate user (Login)
exports.authenticateUser = async (email, password) => {
    const user = await User.findOne({ email });
    if (!user) throw new Error("Invalid email or password.");

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new Error("Invalid email or password.");

    // Generate JWT Token
    const token = jwt.sign({ userId: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: "1h" });

    return { user, token };
};

// 🔹 Get user profile (Read)
exports.getUserProfile = async (userId) => {
    return await User.findById(userId).select("username name email phoneNumber settings devices joinedTo");
};

// 🔹 Update password
exports.updatePassword = async (userId, oldPassword, newPassword) => {
    const user = await User.findById(userId);
    if (!user) throw new Error("User not found.");

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) throw new Error("Incorrect current password.");

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    return { message: "Password updated successfully!" };
};

// 🔹 Update settings (notifications & preferred channel)
exports.updateSettings = async (userId, settingsData) => {
    return await User.findByIdAndUpdate(userId, { settings: settingsData }, { new: true });
};

// 🔹 Manage devices (Add/Remove)
exports.manageDevices = async (userId, deviceInfo, action) => {
    if (action === "add") {
        return await User.findByIdAndUpdate(userId, { $push: { devices: deviceInfo } }, { new: true });
    } else if (action === "remove") {
        return await User.findByIdAndUpdate(userId, { $pull: { devices: { wifi_ip: deviceInfo.wifi_ip } } }, { new: true });
    } else {
        throw new Error("Invalid action for device management.");
    }
};

// 🔹 Manage joined chats (Add/Remove)
exports.manageJoinedChats = async (userId, chatId, action) => {
    if (action === "add") {
        return await User.findByIdAndUpdate(userId, { $addToSet: { joinedTo: chatId } }, { new: true });
    } else if (action === "remove") {
        return await User.findByIdAndUpdate(userId, { $pull: { joinedTo: chatId } }, { new: true });
    } else {
        throw new Error("Invalid action for managing joined chats.");
    }
};

// 🔹 Delete user (Account Deletion)
exports.deleteUser = async (userId) => {
    return await User.findByIdAndDelete(userId);
};


