const Group = require("../models/groupModel");
const GroupBook = require("../models/groupBook");
const GroupMember = require("../models/groupMemberModel");
const Notification = require("../models/notificationModel");
const mongoose = require("mongoose");
const User = require("../models/usersModel");
const { SendRealEmail } = require("../emails/api");
const GroupInvitation = require("../models/groupInvitationModel");
const jwt = require("jsonwebtoken");

module.exports.GetFilteredGroups = (filter) => {
  return new Promise(async (resolve, reject) => {
    try {
      let groups = await Group.find(filter);
      if (groups) {
        resolve({ groups });
      } else {
        resolve({ error: "error finding groups" });
      }
    } catch (er) {
      resolve({ error: "syntax error" });
    }
  });
};

module.exports.GetGroup = (groupId) => {
  return new Promise(async (resolve, reject) => {
    try {
      Group.findOne({ _id: groupId })
        .populate("create_user")
        .exec(async (err, group) => {
          if (group) {
            GroupBook.find({ group_id: groupId })
              .populate("book_id")
              .exec((err, data) => {
                if (err) {
                  resolve({ error: "error getting books of the group" });
                } else {
                  resolve({ books: data, ...group._doc });
                }
              });
          } else {
            resolve({ error: "user doesn't have groups" });
          }
        });
    } catch (er) {
      resolve({ error: "syntax error" });
    }
  });
};

module.exports.CreateGroup = (group) => {
  return new Promise((resolve, reject) => {
    try {
      let newGroup = new Group(group);
      newGroup.save((err) => {
        if (err) {
          resolve({ error: "error creating group" });
        } else {
          let newGroupMember = new GroupMember({
            role: "admin",
            user_id: group.create_user,
            group_id: newGroup._id,
          });
          newGroupMember.save((err) => {
            if (err) {
              resolve({ error: "error creating group member" });
            } else {
              resolve({ group: newGroup, member: newGroupMember });
            }
          });
        }
      });
    } catch (er) {
      resolve({ error: "syntax error" });
    }
  });
};

module.exports.CheckInvitationValidity = (token, inivitationId) => {
  return new Promise(async (resolve, reject) => {
    try {
      let invitation = await GroupInvitation.findOne({
        token: token,
        _id: inivitationId,
      });
      if (invitation) {
        resolve({ valid: true });
      } else {
        resolve({ valid: false });
      }
    } catch (er) {
      resolve({ error: "syntax error" });
    }
  });
};

module.exports.AcceptInvitationToGroup = (groupId, userId, invitationId) => {
  return new Promise(async (resolve, reject) => {
    try {
      newMember = new GroupMember({
        group_id: groupId,
        user_id: userId,
      });
      newMember.save();

      let updatedInvitation = await GroupInvitation.updateOne(
        { _id: invitationId },
        { invitation_status: "accepted" }
      ).exec();
      if (updatedInvitation) {
        resolve({ success: true });
      } else {
        resolve({ error: "error accepting invitation" });
      }
    } catch (er) {
      resolve({ error: "syntax error" });
    }
  });
};

module.exports.InviteToGroup = (email, userId, groupId) => {
  return new Promise(async (resolve, reject) => {
    try {
      let userExists = await User.findOne({ email: email });
      let receiverId;
      if (userExists) {
        receiverId = userExists._id;
      } else {
        let user = new User({ name: email.split("@")[0], email: email });
        user.save();
        receiverId = user._id;
      }

      let invitation = new GroupInvitation({ group_id: groupId });
      jwt.sign(
        { invitation_id: invitation._id },
        "secret_123456789",
        { expiresIn: "7d" },
        (err, token) => {
          if (err) {
            resolve({ error: "error signing invitation with jwt" });
          } else {
            invitation.token = token;
            invitation.save();
            let notification = new Notification({
              receiver_id: receiverId,
              sender_id: userId,
              message: "Invited you to join group",
              link: `/groups/${groupId}/invitations/${token}`,
              date: Date.now(),
            });

            notification.save();

            SendRealEmail(
              email,
              `<div><h4>Hi, you have an invitation</h4><p>Good news! Your are invited to join a group in books app. Follow the link: </p><a href="http://localhost:3000/groups/${groupId}/invitations/${token}">invitation</a></div>`,
              "Invitation to join a group"
            );
            resolve({ success: true });
          }
        }
      );
    } catch (err) {
      resolve({ error: err });
    }
  });
};

module.exports.AddBookToGroup = (groupId, bookId) => {
  return new Promise(async (resolve, reject) => {
    try {
      const bookExists = await GroupBook.findOne({
        group_id: groupId,
        book_id: bookId,
      });
      if (!bookExists) {
        const currReadingBook = await GroupBook.findOne({
          group_id: groupId,
          currently_reading: true,
        });
        const newGroupBook = new GroupBook({
          group_id: groupId,
          book_id: bookId,
          currently_reading: currReadingBook ? false : true,
        });

        newGroupBook.save((er) => {
          if (er) {
            resolve({ error: "error adding book to group" });
          } else {
            resolve({ addedBook: newGroupBook });
          }
        });
      } else {
        resolve({ error: "book is already in your group" });
      }
    } catch (err) {
      resolve({ error: err });
    }
  });
};

module.exports.VoteForNextBook = (bookId, userId, groupId) => {
  return new Promise(async (resolve, reject) => {
    try {
      let member = await GroupMember.findOne({ user_id: userId });
      let prevVote = member.current_vote ? member.current_vote : 0;
      if (prevVote.toString() === bookId.toString()) {
        resolve({ error: "You already voted for this book" });
      } else {
        member.current_vote = bookId;

        member.save(async (er) => {
          if (er) {
            resolve({ error: "error changing user current vote" });
          } else {
            let reducedBook = "something";
            if (prevVote) {
              reducedBook = await GroupBook.updateOne(
                { book_id: prevVote, group_id: groupId },
                { $inc: { read_next_votes: -1 } }
              ).exec();
            }

            let increasedBook = await GroupBook.updateOne(
              { book_id: member.current_vote, group_id: groupId },
              { $inc: { read_next_votes: 1 } }
            ).exec();
            if (increasedBook && reducedBook) {
              resolve({ success: true });
            } else {
              resolve({ error: "error incrementing book votes" });
            }
          }
        });
      }
    } catch (err) {
      resolve({ error: err });
    }
  });
};

module.exports.UpdateGroup = (group) => {
  return new Promise((resolve, reject) => {
    Group.findOneAndUpdate({ _id: group._id }, group, (err, doc) => {
      if (err) {
        resolve({ error: err });
      } else {
        resolve({ message: "Successfuly updated" });
      }
    });
  });
};

module.exports.CompleteBookReading = (groupId, bookId) => {
  return new Promise(async (resolve, reject) => {
    try {
      await GroupBook.update(
        { group_id: groupId, book_id: bookId },
        {
          $set: {
            currently_reading: false,
            book_already_read: true,
            read_finish_date: Date.now(),
          },
        }
      ).exec();

      let groupBooks = await GroupBook.find({
        group_id: groupId,
      });

      let booksArr = groupBooks
        .filter((x) => !x.book_already_read && !x.currently_reading)
        .sort((a, b) =>
          a.read_next_votes > b.read_next_votes
            ? -1
            : a.read_next_votes < b.read_next_votes
            ? 1
            : 0
        );

      let bookLeader = booksArr.length > 0 ? booksArr[0] : null;
      if (bookLeader) {
        await GroupBook.updateOne(
          { group_id: bookLeader.group_id, book_id: bookLeader.book_id },
          {
            $set: {
              currently_reading: true,
            },
          }
        ).exec();
      }

      await GroupBook.updateMany(
        { group_id: groupId },
        { $set: { read_next_votes: 0 } }
      ).exec();
      await GroupMember.updateMany(
        { group_id: groupId },
        { $set: { current_vote: mongoose.Types.ObjectId(1) } }
      ).exec();
      resolve({ success: true });
    } catch (err) {
      resolve({ error: err });
    }
  });
};
