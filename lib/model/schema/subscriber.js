'use strict';

module.exports = exports = function (app, mongoose) {
  var subscriberSchema = new mongoose.Schema({
    //用户系统信息
    openId: { type: String, index: true },
    groupId: String,

    //微信缓存属性
    subscribe: {type: Boolean, default: true, index: true},
    subscribeTime: Date,
    nickname: String,
    sex: Number,//0: 未知，1：男，2：女
    headImgUrl: String,
    wCity: String,
    wProvince: String,
    wCountry: String,

    // 应用相关属性
    lastActionTime: Date
  });
  
  app.db.model('Subscriber', subscriberSchema);
};
