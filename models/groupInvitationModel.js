const mongoose = require("mongoose");

const { Schema, model } = mongoose;

const GroupInvitationSchema = new Schema({
  group_id: { type: mongoose.Schema.Types.ObjectId, ref: "Group" },
  token: String,
  invitation_status: {
    type: String,
    enum: ["accepted", "rejected", "waiting"],
    default: "waiting",
  },
});

const GroupInvitation = mongoose.model(
  "GroupInvitation",
  GroupInvitationSchema
);

module.exports = GroupInvitation;
