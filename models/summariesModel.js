const mongoose = require("mongoose");

const { Schema, model } = mongoose;

const SummariesSchema = new Schema({
  date: { type: Number },
  author: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  private: { type: Boolean, default: false },
  summary: { type: String },
  ratings: [
    {
      ratedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      rating: { type: Number },
    },
  ],
  rating: { type: Number, default: 0 },
});

const Summary = mongoose.model("Summary", SummariesSchema);

module.exports = Summary;
