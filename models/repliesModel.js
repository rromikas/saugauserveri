const mongoose = require("mongoose");

const { Schema, model } = mongoose;

const RepliesSchema = new Schema({
  date: Number,
  reply: String,
  votes: [
    {
      by: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      value: { type: Number },
    },
  ],
  repliedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
});

const Reply = mongoose.model("Reply", RepliesSchema);

module.exports = Reply;
