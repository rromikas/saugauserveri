const User = require("../models/usersModel");
const Books = require("../models/booksModel");
const Summary = require("../models/summariesModel");
const verifyToken = require("../verifications/token");

module.exports.GetSummary = ({ summaryId, userToken }) => {
  return new Promise(async (resolve, reject) => {
    try {
      let summary = await Summary.findOne({ _id: summaryId })
        .populate("bookId")
        .populate("author")
        .populate({
          path: "comments",
          populate: { path: "repliedBy votes.by" },
        })
        .exec();
      if (summary) {
        if (summary.private) {
          verifyToken(userToken, (err, data) => {
            if (err) {
              resolve({ error: "Can't identify user" });
            } else {
              if (summary.author.email === data.email) {
                resolve({ summary });
              } else {
                resolve({ error: "User is not the author of private summary" });
              }
            }
          });
        } else {
          resolve({ summary });
        }
      } else {
        resolve({ error: "Couldn't get summary" });
      }
    } catch (er) {
      resolve({ error: "syntax error" });
    }
  });
};

module.exports.AddSummary = ({ bookId, summary }) => {
  return new Promise(async (resolve, reject) => {
    try {
      let newSummary = new Summary({
        summary: summary.summary,
        private: summary.private,
        date: Date.now(),
        author: summary.authorId,
        bookId: bookId,
        title: summary.title,
      });
      newSummary.save();
      const updatedBook = await Books.findOneAndUpdate(
        { _id: bookId },
        {
          $push: {
            summaries: {
              _id: newSummary._id,
            },
          },
        }
      );

      const updatedUser = await User.findOneAndUpdate(
        { _id: summary.authorId },
        {
          $push: {
            summaries: {
              _id: newSummary._id,
            },
          },
        }
      );
      if (updatedBook && updatedUser) {
        resolve({ updatedBook, updatedUser });
      } else {
        resolve({
          error: updatedBook
            ? "couldn't find summary author"
            : "couldn't find book the summary is written for",
        });
      }
    } catch (er) {
      resolve({ error: "Syntax error" });
    }
  });
};

module.exports.GetTopRatedSummaries = ({ bookId, limit }) => {
  return new Promise(async (resolve, reject) => {
    try {
      const doc = await Books.findOne({ _id: bookId })
        .populate({
          path: "summaries",
          populate: { path: "author" },
        })
        .select("summaries");
      if (doc.summaries) {
        let summaries = doc.summaries.slice(0);
        summaries.sort((a, b) =>
          a["rating"] > b["rating"] ? -1 : a["rating"] < b["rating"] ? 1 : 0
        );
        summaries = summaries.slice(0, limit);
        resolve({ summaries });
      } else {
        resolve({ error: "No such summaries" });
      }
    } catch (er) {
      resolve({ error: "Syntax error" });
    }
  });
};

module.exports.RateSummary = ({ summaryId, userId, rating }) => {
  return new Promise(async (resolve, reject) => {
    try {
      const summary = await Summary.findOne({ _id: summaryId });
      if (summary) {
        let ratings = summary.ratings;
        let newRating, updatedSummary;
        let index = ratings.findIndex(
          (x) => x.ratedBy.toString() === userId.toString()
        );
        if (index >= 0) {
          ratings[index].rating = rating;
          newRating =
            ratings.reduce((a, b) => a + b.rating, 0) / ratings.length;
          updatedSummary = await Summary.update(
            { _id: summaryId, "ratings.ratedBy": userId },
            {
              $set: { "ratings.$.rating": rating },
              rating: newRating,
            }
          ).exec();
        } else {
          let sumOfRatings = ratings.reduce((a, b) => a + b.rating, rating);
          newRating = sumOfRatings / (ratings.length + 1);
          updatedSummary = await Summary.findOneAndUpdate(
            { _id: summaryId },
            {
              $push: { ratings: { ratedBy: userId, rating: rating } },
              rating: newRating,
            }
          ).exec();
        }

        if (updatedSummary) {
          resolve({ updatedSummary });
        } else {
          resolve({ error: "Error updating summary" });
        }
      } else {
        resolve({ error: "Couldn't find such summary" });
      }
    } catch (er) {
      resolve({ error: "Syntax error" });
    }
  });
};

module.exports.GetMostRecentSummaries = ({ bookId }) => {
  return new Promise(async (resolve, reject) => {
    try {
      const summaries = await Summary.find({ bookId: bookId })
        .populate("author")
        .exec();
      if (summaries) {
        let publicSummaries = summaries.filter((x) => !x.private);
        publicSummaries.sort((a, b) =>
          a.date < b.date ? 1 : a.date > b.date ? -1 : 0
        );
        resolve({ summaries: publicSummaries });
      } else {
        resolve({ error: "couldn't find summaries" });
      }
    } catch (er) {
      resolve({ error: "syntax error" });
    }
  });
};

module.exports.GetTopRatedSummaries = ({ bookId }) => {
  return new Promise(async (resolve, reject) => {
    try {
      const summaries = await Summary.find({ bookId: bookId })
        .populate("author")
        .exec();
      if (summaries) {
        let publicSummaries = summaries.filter((x) => !x.private);
        publicSummaries.sort((a, b) =>
          a.rating < b.rating ? 1 : a.rating > b.rating ? -1 : 0
        );
        resolve({ summaries: publicSummaries });
      } else {
        resolve({ error: "couldn't find summaries" });
      }
    } catch (er) {
      resolve({ error: "syntax error" });
    }
  });
};

module.exports.EditSummary = ({ summaryId, summary }) => {
  return new Promise(async (resolve, reject) => {
    try {
      let updatedSummary = await Summary.findByIdAndUpdate(
        { _id: summaryId },
        summary
      );
      if (updatedSummary) {
        resolve({ updatedSummary });
      } else {
        resolve({ error: "couldn't edit summary" });
      }
    } catch (er) {
      resolve({ error: "syntax error" });
    }
  });
};
