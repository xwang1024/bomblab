'use strict';

module.exports = exports = function (app, mongoose) {
  var replyQueue = new mongoose.Schema({
    name: { type: String },
    messageGroups: { type: Array },
    createdAt: { type: Date, default: Date.now }
  });
  app.db.model('ReplyQueue', replyQueue);
};