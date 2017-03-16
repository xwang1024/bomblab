'use strict';

module.exports = exports = function (app, mongoose) {
  var subscriberSchema = new mongoose.Schema({
    //用户系统信息
    openId: { type: String, index: true },
    groupId: String,
    unionId: String,

    //微信缓存属性
    subscribe: {type: Boolean, default: true, index: true},
    subscribeTime: Date,
    nickname: String,
    remark: String,
    gender: Number,//0: 未知，1：男，2：女
    headImgUrl: String,
    city: String,
    province: String,
    country: String,
    language: String,

    // 邀请人 OpenId
    introducerOpenId: { type: String, index: true }
  });
  
  app.db.model('Subscriber', subscriberSchema);
};
