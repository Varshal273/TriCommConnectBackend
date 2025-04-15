const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema({
    group: [{ type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }],
    msg: [
        {
            senderUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
            msgBody: { type: String },
            time: { type: Date, default: Date.now }
        }
    ],
    groupName: {
        type: String,
        default: function () {
            return this.group.join(", ");
        }
    },
    lastMessage: {
        senderUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        msgBody: { type: String },
        time: { type: Date, default: Date.now }
    }
}, { timestamps: true });

const Chat = mongoose.model("Chat", chatSchema);
module.exports = Chat;


// const mongoose = require("mongoose");

// const chatSchema = new mongoose.Schema({
//     group: [{ type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }], // List of user IDs in the chat
//     msg: [
//         {
//             senderUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
//             msgBody: { type: String },
//             time: { type: Date, default: Date.now }
//         }
//     ],
//     groupName: { type: String, default: function() { return this.group.join(", "); } }
// }, { timestamps: true });

// const Chat = mongoose.model("Chat", chatSchema);
// module.exports = Chat;
