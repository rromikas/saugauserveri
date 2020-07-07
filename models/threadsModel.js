const mongoose = require("mongoose");

const { Schema, model } = mongoose;

const ThreadsSchema = new Schema({
  date: Number,
  title: String,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  views: { type: Number, default: 0 },
  description: {
    type: String,
    default: "No description provided",
  },
  replies: [{ type: mongoose.Schema.Types.ObjectId, ref: "Reply" }],
  group: { type: mongoose.Schema.Types.ObjectId, ref: "Group" },
});

const Thread = mongoose.model("Thread", ThreadsSchema);

module.exports = Thread;
