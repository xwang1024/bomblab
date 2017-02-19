'use strict';

module.exports = exports = function (app, mongoose) {
  var customMessageGroup = new mongoose.Schema({
    name: { type: String },
    messages: { type: Array },
    createdAt: { type: Date, default: Date.now }
  });
  app.db.model('CustomMessageGroup', customMessageGroup);
};