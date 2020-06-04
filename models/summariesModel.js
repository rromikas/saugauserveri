const mongoose = require("mongoose");

const { Schema, model } = mongoose;

const SummariesSchema = new Schema({
  date: { type: Number },
  author: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  private: { type: Boolean, default: false },
  summary: { type: String },
  views: { type: Number, default: 0 },
  ratings: [
    {
      ratedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      rating: { type: Number },
    },
  ],
  bookId: { type: mongoose.Schema.Types.ObjectId, ref: "books" },
  rating: { type: Number, default: 0 },
  comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Reply" }],
});

const Summary = mongoose.model("Summary", SummariesSchema);

module.exports = Summary;
