const mongoose = require("mongoose");

const { Schema, model } = mongoose;

const BooksSchema = new Schema({
  dateAdded: {
    type: Number,
  },
  title: {
    type: String,
  },
  authors: {
    type: String,
  },
  description: {
    type: String,
  },
  image: {
    type: String,
  },
  genre: {
    type: String,
  },
  isbn10: {
    type: String,
  },
  isbn13: {
    type: String,
  },
  language: {
    type: String,
  },
  publishedDate: {
    type: String,
  },
  publisher: {
    type: String,
  },
  subtitle: {
    type: String,
  },

  favoriteFor: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

  summaries: [{ type: mongoose.Schema.Types.ObjectId, ref: "Summary" }],

  threads: [{ type: mongoose.Schema.Types.ObjectId, ref: "Thread" }],

  quizzes: [{ type: mongoose.Schema.Types.ObjectId, ref: "Quiz" }],
});

const Books = model("books", BooksSchema);

module.exports = Books;
