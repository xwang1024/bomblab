'use strict';

module.exports = exports = function (app, mongoose) {
  var subscribeReply = new mongoose.Schema({
    waitMinutes: { type: Number, default: 0 },
    messages: { type: Array },
    createdAt: { type: Date, default: Date.now }
  });
  app.db.model('SubscribeReply', subscribeReply);
};