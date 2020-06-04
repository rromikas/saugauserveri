const User = require("../models/usersModel");
const Books = require("../models/booksModel");
const Summary = require("../models/summariesModel");
const Thread = require("../models/threadsModel");
const Reply = require("../models/repliesModel");

module.exports.VoteForReply = ({ userId, replyId, vote }) => {
  return new Promise(async (resolve, reject) => {
    try {
      let updatedVote;
      let updatedReply = await Reply.update(
        { _id: replyId, "votes.by": userId },
        {
          $set: { "votes.$.value": vote },
        }
      ).exec();

      if (updatedReply.n === 0) {
        updatedVote = await Reply.findOneAndUpdate(
          { _id: replyId },
          { $push: { votes: { by: userId, value: vote } } }
        ).exec();
      }

      if (updatedVote || updatedReply.n > 0) {
        resolve({ updatedValue });
      } else
        resolve({
          error:
            updatedReply.n === 0
              ? "couldn't regiter new vote"
              : "couldn't update existing vote",
        });
    } catch (er) {
      resolve({ error: "Syntax error" });
    }
  });
};

module.exports.CommentSummary = ({ reply, userId, summaryId }) => {
  return new Promise(async (resolve, reject) => {
    try {
      let newReply = new Reply({
        date: Date.now(),
        reply: reply,
        repliedBy: userId,
      });

      newReply.save();
      const insertedReply = await Summary.findOneAndUpdate(
        { _id: summaryId },
        {
          $push: {
            comments: {
              _id: newReply._id,
            },
          },
        }
      );
      if (insertedReply) {
        resolve({ insertedReply });
      } else resolve({ error: "Couldn't reply to question" });
    } catch (er) {
      resolve({ error: "Syntax error" });
    }
  });
};

module.exports.ReplyToQuestion = ({ reply, userId, threadId }) => {
  return new Promise(async (resolve, reject) => {
    try {
      let newReply = new Reply({
        date: Date.now(),
        reply: reply,
        repliedBy: userId,
      });

      newReply.save();
      const insertedReply = await Thread.findOneAndUpdate(
        { _id: threadId },
        {
          $push: {
            replies: {
              _id: newReply._id,
            },
          },
        }
      );
      if (insertedReply) {
        resolve({ insertedReply });
      } else resolve({ error: "Couldn't reply to question" });
    } catch (er) {
      resolve({ error: "Syntax error" });
    }
  });
};
