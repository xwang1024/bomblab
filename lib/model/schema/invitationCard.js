'use strict';

const autoIncrement = require('mongoose-auto-increment');

module.exports = exports = function (app, mongoose) {
  var invitationCard = new mongoose.Schema({
    invitationTask: { type: mongoose.Schema.Types.ObjectId, ref: "InvitationTask" },
    qrTicket: { type: String, index: true },
    openId: { type: String, index: true },
    nickname: { type: String },
    headImgUrl: { type: String },
    invitedCount: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
  });
  invitationCard.plugin(autoIncrement.plugin, 'InvitationCard');
  app.db.model('InvitationCard', invitationCard);
};