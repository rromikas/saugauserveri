const mongoose = require("mongoose");

const { Schema, model } = mongoose;

const QuizSchema = new Schema({
  group_id: { type: mongoose.Schema.Types.ObjectId, ref: "Group" },
  book_id: { type: mongoose.Schema.Types.ObjectId, ref: "books" },
  questions: [],
  time: Number,
  create_user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
});

const Quiz = mongoose.model("Quiz", QuizSchema);

module.exports = Quiz;
