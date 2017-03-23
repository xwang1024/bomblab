'use strict';

module.exports = exports = function (app, mongoose) {
  var invitationTask = new mongoose.Schema({
    name: { type: String },
    threshold: { type: Number, default: 1 },
    status: { type: String, enum: ['NEW', 'CLOSE', 'OPEN'], default: 'NEW' },
    cardSetting: {},
    rewardMessageSetting: {},
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
  });
  app.db.model('InvitationTask', invitationTask);
};