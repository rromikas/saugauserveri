const User = require("../models/usersModel");
const Books = require("../models/booksModel");
const Summary = require("../models/summariesModel");
const Thread = require("../models/threadsModel");
const Reply = require("../models/repliesModel");

module.exports.GetThread = ({ bookId, threadId }) => {
  return new Promise(async (resolve, reject) => {
    let filter = {};
    filter["_id"] = bookId;
    filter["threads._id"] = threadId;
    try {
      const thread = await Thread.findOne({ _id: threadId })
        .populate("createdBy")
        .populate({
          path: "replies",
          populate: { path: "repliedBy votes.by" },
        })

        .exec();
      if (thread) {
        resolve({ success: true, thread: thread });
      } else resolve({ error: true });
    } catch (er) {
      resolve({ error: true });
    }
  });
};

module.exports.CreateThread = ({ bookId, userId, title, description }) => {
  return new Promise(async (resolve, reject) => {
    try {
      let newThread = new Thread({
        date: Date.now(),
        title: title,
        createdBy: userId,
        description: description,
      });
      newThread.save();

      const createdThread = await Books.findOneAndUpdate(
        { _id: bookId },
        {
          $push: {
            threads: {
              _id: newThread._id,
            },
          },
        }
      );
      if (createdThread) {
        resolve({ createdThread });
      } else resolve({ error: "Couldn't create thread" });
    } catch (er) {
      resolve({ error: "Syntax error" });
    }
  });
};

module.exports.GetLatestThreads = ({ bookId, limit }) => {
  return new Promise(async (resolve, reject) => {
    try {
      const doc = await Books.findOne({ _id: bookId })
        .populate({ path: "threads", populate: { path: "createdBy" } })
        .select("threads");
      if (doc.threads) {
        let threads = doc.threads.slice(0);
        threads.sort((a, b) =>
          a["date"] > b["date"] ? -1 : a["date"] < b["date"] ? 1 : 0
        );
        threads = threads.slice(0, limit);
        resolve({ threads });
      } else {
        resolve({ error: "No such threads" });
      }
    } catch (er) {
      resolve({ error: "Syntax error" });
    }
  });
};
module.exports.GetUnansweredThreads = ({ bookId, limit }) => {
  return new Promise(async (resolve, reject) => {
    try {
      const doc = await Books.findOne({ _id: bookId })
        .populate({ path: "threads", populate: { path: "createdBy" } })
        .select("threads");
      if (doc.threads) {
        let threads = doc.threads.slice(0);
        threads.sort((a, b) =>
          a["replies"].length > b["replies"].length
            ? 1
            : a["replies"].length < b["replies"].length
            ? -1
            : 0
        );
        threads = threads.slice(0, limit);
        resolve({ threads });
      } else {
        resolve({ error: "No such threads" });
      }
    } catch (er) {
      resolve({ error: "Syntax error" });
    }
  });
};

module.exports.GetTopThreads = ({ bookId, limit }) => {
  return new Promise(async (resolve, reject) => {
    try {
      const proportion = 2; // reply is worth two times as view
      const doc = await Books.findOne({ _id: bookId })
        .populate({ path: "threads", populate: { path: "createdBy" } })
        .select("threads");
      if (doc.threads) {
        let threads = doc.threads.slice(0);
        threads.sort((a, b) =>
          a["replies"].length * proportion + a["views"] >
          b["replies"].length * proportion + b["views"]
            ? -1
            : a["replies"].length * proportion + a["views"] <
              b["replies"].length * proportion + b["views"]
            ? 1
            : 0
        );
        threads = threads.slice(0, limit);
        resolve({ threads });
      } else {
        resolve({ error: "No such threads" });
      }
    } catch (er) {
      resolve({ error: "Syntax error" });
    }
  });
};

module.exports.AddView = ({ bookId, threadId }) => {
  return new Promise(async (resolve, reject) => {
    try {
      const updatedValue = await Thread.findOneAndUpdate(
        { _id: threadId },
        {
          $inc: { views: 1 },
        }
      ).exec();
      if (updatedValue) {
        resolve({ updatedValue });
      } else resolve({ error: "Couldn't add view" });
    } catch (er) {
      resolve({ error: "Syntax error" });
    }
  });
};
