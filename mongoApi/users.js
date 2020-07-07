const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/usersModel");
const Books = require("../models/booksModel");
require("dotenv").config();
const secret = process.env.SECRET;
const GroupMember = require("../models/groupMemberModel");
const Notification = require("../models/notificationModel");

module.exports.ReadUser = (user) => {
  return new Promise((resolve, reject) => {
    try {
      User.findOne({ email: user.email })
        .populate("favoriteBooks")
        .populate({ path: "summaries", populate: { path: "bookId" } })
        .exec(async (err, data) => {
          if (data) {
            const member = await GroupMember.findOne({ user_id: data._id });

            resolve({
              user: {
                groupMember: member ? member : { current_vote: -1, role: "" },
                ...data._doc,
              },
            });
          } else {
            resolve({ error: "no such user" });
          }
        });
    } catch (er) {
      resolve({ error: "syntax error" });
    }
  });
};

module.exports.GetNotifications = (userId) => {
  return new Promise(async (resolve, reject) => {
    try {
      let notifications = await Notification.find({
        receiver_id: userId,
        sender_id: { $ne: userId },
      })
        .populate("sender_id")
        .sort({ date: -1 })
        .exec();
      if (notifications) {
        resolve({ notifications: notifications });
      } else {
        resolve({ error: "failed getting notifications" });
      }
    } catch (er) {
      resolve({ error: "syntax error" });
    }
  });
};

module.exports.UpdateUser = (user) => {
  return new Promise((resolve, reject) => {
    User.findOneAndUpdate({ email: user.email }, user, (err, doc) => {
      if (err) {
        resolve({ error: err });
      } else {
        resolve({ message: "Successfuly updated" });
      }
    });
  });
};

module.exports.Login = (data) => {
  return new Promise((resolve, reject) => {
    User.findOne({ email: data.email }).then((user) => {
      if (user) {
        if (user.password) {
          bcrypt.compare(data.password, user.password, (err, isMatch) => {
            if (err) {
              resolve({ error: "Password comparison failed" });
            } else if (isMatch) {
              jwt.sign(
                { data: user },
                secret,
                { expiresIn: "7d" },
                async (err, token) => {
                  if (err) {
                    resolve({ error: "jwt error email form login" });
                  } else {
                    const member = await GroupMember.findOne({
                      user_id: user._id,
                    });
                    resolve({
                      token: token,
                      user: {
                        groupMember: member
                          ? member
                          : { current_vote: -1, role: "" },
                        name: user.name,
                        photo: user.photo,
                        description: user.description,
                        _id: user._id,
                      },
                    });
                  }
                }
              );
            } else {
              resolve({ error: "Wrong password" });
            }
          });
        } else {
          resolve({ error: "Use other login method" });
        }
      } else {
        resolve({ error: "No such email" });
      }
    });
  });
};

module.exports.Signup = (data) => {
  return new Promise((resolve, reject) => {
    let { email } = data;
    User.findOne({ email: email }).then((user) => {
      if (user) {
        resolve({ error: "User already exists" });
      } else {
        let newUser = new User({
          email: email,
          name: data.name ? data.name : email.split("@")[0],
        });

        bcrypt.genSalt(10).then((salt) => {
          bcrypt.hash(data.password, salt, (err, hash) => {
            newUser.password = hash;
            newUser
              .save()
              .then(() => {
                resolve({ message: "User created" });
              })
              .catch((er) => {
                resolve({ error: "bcrypt encoding error" });
              });
          });
        });
      }
    });
  });
};

module.exports.FacebookSignup = (userData) => {
  return new Promise((resolve, reject) => {
    jwt.sign({ data: userData }, secret, { expiresIn: "7d" }, (err, token) => {
      if (err) {
        resolve({ error: err });
      } else {
        User.findOne({ email: userData.email }).then(async (user) => {
          if (!user) {
            //create user if doesn't exist
            let name = userData.name
              ? userData.name
              : userData.email.split("@")[0];
            let newUser = new User({
              email: userData.email,
              name: name,
              photo: userData.photoUrl,
            });
            newUser
              .save()
              .then(async () => {
                const member = await GroupMember.findOne({
                  user_id: newUser._id,
                });
                resolve({
                  message: "User created",
                  token: token,
                  user: {
                    groupMember: member
                      ? member
                      : { current_vote: -1, role: "" },
                    name: newUser.name,
                    photo: newUser.photo,
                    description: newUser.description,
                    _id: newUser._id,
                  },
                });
              })
              .catch((er) => {
                resolve({ error: er });
              });
          } else {
            const member = await GroupMember.findOne({ user_id: user._id });
            console.log("Member facebook signup", member);
            resolve({
              token: token,
              user: {
                groupMember: member ? member : { current_vote: -1, role: "" },
                name: user.name,
                photo: user.photo,
                description: user.description,
                _id: user._id,
              },
            });
          }
        });
      }
    });
  });
};

module.exports.GoogleSignup = (userData) => {
  return new Promise((resolve, reject) => {
    jwt.sign({ data: userData }, secret, { expiresIn: "7d" }, (err, token) => {
      if (err) {
        resolve({ error: err });
      } else {
        User.findOne({ email: userData.email }).then(async (user) => {
          if (!user) {
            //create user if doesn't exist
            let name = userData.name
              ? userData.name
              : userData.email.split("@")[0];
            let newUser = new User({
              email: userData.email,
              name: name,
              photo: userData.photoUrl,
            });
            newUser
              .save()
              .then(async () => {
                const member = await GroupMember.findOne({
                  user_id: newUser._id,
                });
                resolve({
                  message: "User created",
                  token: token,
                  user: {
                    groupMember: member
                      ? member
                      : { current_vote: -1, role: "" },
                    name: newUser.name,
                    photo: newUser.photo,
                    description: newUser.description,
                    _id: newUser._id,
                  },
                });
              })
              .catch((er) => {
                resolve({ error: er });
              });
          } else {
            const member = await GroupMember.findOne({ user_id: user._id });
            console.log("Member google signup", member);
            resolve({
              token: token,
              user: {
                groupMember: member ? member : { current_vote: -1, role: "" },
                name: user.name,
                photo: user.photo,
                description: user.description,
                _id: user._id,
              },
            });
          }
        });
      }
    });
  });
};
