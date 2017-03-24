'use strict';

module.exports = exports = function (app, mongoose) {
  var invitationTask = new mongoose.Schema({
    name: { type: String },
    threshold: { type: Number, default: 1 },
    status: { type: String, enum: ['NEW', 'CLOSE', 'OPEN'], default: 'NEW' },
    cardSetting: {},
    rewardType: { type: String, enum: ['TEMPLATE', 'CUSTOM'], default: 'TEMPLATE' },
    rewardMessageSetting: {},
    rewardImageMediaId: { type: String },
    rewardText: { type: String },
    introduction: { type: String },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
  });
  app.db.model('InvitationTask', invitationTask);
};