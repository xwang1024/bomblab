'use strict';

module.exports = exports = function (app, mongoose) {
  var customSendLog = new mongoose.Schema({
    customMessageGroup: {type: mongoose.Schema.Types.ObjectId, ref: "CustomMessageGroup"},
    openId: { type: String },
    status: { type: String },
    createdAt: { type: Date, default: Date.now }
  });
  app.db.model('CustomSendLog', customSendLog);
};