'use strict';

module.exports = exports = function (app, mongoose) {
  var invitationCard = new mongoose.Schema({
    subscriber: { type: mongoose.Schema.Types.ObjectId, ref: "Subscriber" },
    cardImgUrl: { type: String },
    invitedCount: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now }
  });
  app.db.model('InvitationCard', invitationCard);
};