'use strict';

module.exports = exports = function (app, mongoose) {
  var invitationCard = new mongoose.Schema({
    openId: { type: String, index: true },
    nickname: { type: String },
    headImgUrl: { type: String },
    invitedCount: { type: Number, default: 0 },
    updatedAt: { type: Date, default: Date.now }
  });
  app.db.model('InvitationCard', invitationCard);
};