const Quiz = require("../models/quizModel");
const QuizResult = require("../models/quizResultModel");
const mongoose = require("mongoose");
const Group = require("../models/groupModel");
const GroupMember = require("../models/groupMemberModel");
const Notification = require("../models/notificationModel");

module.exports.GetAllQuizzes = (bookId, groupId) => {
  return new Promise(async (resolve, reject) => {
    try {
      Quiz.find()
        .or([
          { book_id: bookId, group_id: mongoose.Types.ObjectId(groupId) },
          { book_id: bookId, group_id: null },
        ])
        .populate("create_user")
        .exec((err, data) => {
          if (err) {
            resolve({ error: "error getting quizzes" });
          } else {
            resolve({ quizzes: data });
          }
        });
    } catch (er) {
      resolve({ error: er });
    }
  });
};

module.exports.CreateQuiz = (quiz) => {
  return new Promise((resolve, reject) => {
    try {
      let newQuiz = new Quiz(quiz);
      newQuiz.save((er) => {
        if (er) {
          resolve({ error: "error submitting new quiz" });
        } else {
          resolve({ newQuiz: newQuiz });
        }
      });
    } catch (er) {
      resolve({ error: er });
    }
  });
};

module.exports.GetQuiz = (quizId) => {
  return new Promise(async (resolve, reject) => {
    try {
      Quiz.findOne({ _id: quizId })
        .populate("book_id")
        .populate("create_user")
        .exec((err, data) => {
          if (err) {
            resolve({ error: "erorr getting quiz" });
          } else {
            resolve({ quiz: data });
          }
        });
    } catch (er) {
      console.log("erorr", er);
      resolve({ error: er });
    }
  });
};

module.exports.SubmitQuizResult = (result, groupId, bookId) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (groupId) {
        let allGroupMembers = await GroupMember.find({ group_id: groupId });
        let notifications = [];
        allGroupMembers.forEach((x) => {
          let n = {
            sender_id: result.user_id,
            receiver_id: x.user_id,
            message: `Played quiz and answered ${Math.floor(
              (result.correct_answers / result.questions) * 100
            )}%. Can you do better?`,
            date: Date.now(),
            link: `/books/${bookId}/quiz/${result.quiz_id}`,
          };
          notifications.push(n);
        });
        Notification.create(notifications, (err) => {
          if (err) {
            resolve({ error: "error creating notifications" });
          } else {
            let newQuizResult = new QuizResult(result);
            newQuizResult.save((er) => {
              if (er) {
                resolve({ error: er });
              } else {
                resolve({ newQuizResult });
              }
            });
          }
        });
      }
    } catch (er) {
      console.log("erorr", er);
      resolve({ error: er });
    }
  });
};
