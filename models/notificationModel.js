const mongoose = require("mongoose");

const { Schema, model } = mongoose;

const NotificationSchema = new Schema({
  sender_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  receiver_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  message: String,
  date: Number,
  link: String,
  seen: { type: Boolean, default: false },
});

const Notification = mongoose.model("Notification", NotificationSchema);

module.exports = Notification;
