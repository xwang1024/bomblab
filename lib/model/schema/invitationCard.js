'use strict';

module.exports = exports = function (app, mongoose) {
  var invitationCard = new mongoose.Schema({
    invitationTask: { type: mongoose.Schema.Types.ObjectId, ref: "InvitationTask" },
    openId: { type: String, index: true },
    nickname: { type: String },
    headImgUrl: { type: String },
    invitedCount: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
  });
  app.db.model('InvitationCard', invitationCard);
};