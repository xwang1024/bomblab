'use strict';

module.exports = exports = function (app, mongoose) {
  var invitationCard = new mongoose.Schema({
    openId: { type: String },
    setting: { type: mongoose.Schema.Types.ObjectId, ref: "Setting" },
    cardImgKey: { type: String },
    invitedCount: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now }
  });
  app.db.model('InvitationCard', invitationCard);
};