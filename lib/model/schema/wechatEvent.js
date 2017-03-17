'use strict';

module.exports = exports = function (app, mongoose) {
  var wechatEvent = new mongoose.Schema({
    event: {},
    createdAt: { type: Date, default: Date.now }
  });
  app.db.model('WechatEvent', wechatEvent);
};