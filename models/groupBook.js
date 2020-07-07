const mongoose = require("mongoose");

const { Schema, model } = mongoose;

const GroupBookSchema = new Schema({
  group_id: { type: mongoose.Schema.Types.ObjectId, ref: "Group" },
  book_id: { type: mongoose.Schema.Types.ObjectId, ref: "books" },
  currently_reading: { type: Boolean, default: false },
  book_already_read: { type: Boolean, default: false },
  read_finish_date: Number,
  read_next_votes: { type: Number, default: 0 },
});

const GroupBook = mongoose.model("GroupBook", GroupBookSchema);

module.exports = GroupBook;
