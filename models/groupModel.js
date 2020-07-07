const mongoose = require("mongoose");

const { Schema, model } = mongoose;

const GroupSchema = new Schema({
  name: String,
  description: String,
  background_photo: String,
  create_date: Number,
  create_user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  score: { type: Number, default: 0 },
  interested_genres: [{ type: String }],
});

const Group = mongoose.model("Group", GroupSchema);

module.exports = Group;
