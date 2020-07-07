const User = require("../models/usersModel");
const Books = require("../models/booksModel");
const Summary = require("../models/summariesModel");
const Thread = require("../models/threadsModel");
const Reply = require("../models/repliesModel");
const Notification = require("../models/notificationModel");

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

module.exports.CommentSummary = ({
  reply,
  userId,
  summaryId,
  summary_aurthor_id,
  bookId,
}) => {
  return new Promise(async (resolve, reject) => {
    try {
      let newReply = new Reply({
        date: Date.now(),
        reply: reply,
        repliedBy: userId,
      });

      newReply.save();

      let newNotification = new Notification({
        receiver_id: summary_aurthor_id,
        sender_id: userId,
        date: Date.now(),
        message: "Replied to you summary",
        link: `/books/${bookId}/summaries/${summaryId}`,
      });

      newNotification.save();

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

module.exports.ReplyToQuestion = ({
  reply,
  userId,
  threadId,
  thread_author_id,
  bookId,
}) => {
  return new Promise(async (resolve, reject) => {
    try {
      let newReply = new Reply({
        date: Date.now(),
        reply: reply,
        repliedBy: userId,
      });

      let notification = new Notification({
        sender_id: userId,
        receiver_id: thread_author_id,
        message: "Replied to your question",
        link: `/books/${bookId}/threads/${threadId}`,
        date: Date.now(),
      });

      notification.save();

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
