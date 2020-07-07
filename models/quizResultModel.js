const mongoose = require("mongoose");

const { Schema, model } = mongoose;

const QuizResultSchema = new Schema({
  quiz_id: { type: mongoose.Schema.Types.ObjectId, ref: "Quiz" },
  correct_answers: Number,
  questions: Number,
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
});

const QuizResult = mongoose.model("QuizResult", QuizResultSchema);

module.exports = QuizResult;
