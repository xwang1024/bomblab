'use strict';

module.exports = exports = function (app, mongoose) {
  var replyQueueLogSchema = new mongoose.Schema({
    //用户系统信息
    openId: { type: String, index: true },
    replyQueue: {type: mongoose.Schema.Types.ObjectId, ref: "ReplyQueue"},
    clickCount: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now }
  });
  
  app.db.model('ReplyQueueLog', replyQueueLogSchema);
};
