const mongoose = require("mongoose");

const { Schema, model } = mongoose;

const GroupMemberSchema = new Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  group_id: { type: mongoose.Schema.Types.ObjectId, ref: "Group" },
  role: {
    type: String,
    enum: ["admin", "co-admin", "chief", "member"],
    default: "member",
  },
  current_vote: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "books",
  },
  quizzes_taken: { type: Number, default: 0 },
  questions_asked: { type: Number, default: 0 },
  discussions_contributed: { type: Number, default: 0 },
});

const GroupMember = mongoose.model("GroupMember", GroupMemberSchema);

module.exports = GroupMember;
