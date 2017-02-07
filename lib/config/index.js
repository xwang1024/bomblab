'use strict';

exports.cluster = false;
exports.workerNum = 1;
exports.port = process.env.PORT || '3000';
exports.token = 'hs@01Cre';

exports.redis = {
  host: '127.0.0.1',
  port: 6379,
  prefix: 'hs_bomblab_'
}

exports.wechat = {
  appid: 'wx0a912b7961d2abe0',
  secret: '5a7efa9f548fb61263ba56b381b8b7ed',
  token: 'hs@01Cre',
  AESKey: 'IjNAn4YmUSrTymY0D5f5Dn4WjV0diAXAyYYqRxj561U',
  timeoutMillis: 5000
}

exports.sms = {
  appKey: '23430240',
  appSecret: '90919caafbcf22370b8e43fd3a2da3ce',
  endPoint: 'http://gw.api.taobao.com/router/rest'
};

exports.mongodb = {
  uri: process.env.MONGOLAB_URI || process.env.MONGOHQ_URL || 'mongodb://localhost:27017/bomblab'
};

exports.cryptoKey = 'o9fn442os57';
exports.loginAttempts = {
  forIp: 50,
  forIpAndUser: 7,
  logExpiration: '20m'
};

exports.wechatEnabled = true;
exports.wechatMenuUpdate = false;
exports.wechatTimeout = 5000;
exports.wechatMenu = {
  "button": [{
    "name": "知识库",
    "sub_button": [{
      "type": "view",
      "name": "常见问题",
      "url": "/wechat/common-question"
    }, {
      "type": "click",
      "name": "历史文章",
      "key": "history_article"
    }, {
      "type": "click",
      "name": "通知公告",
      "key": "announcement"
    }/*, {
     "type": "view",
     "name": "大咖干货",
     "url": ""
     }*/]
  }, {
    "name": "自我测评",
    "sub_button": [{
      "type": "view",
      "name": "随身测",
      "url": "/wechat/scale"
    }, {
      "type": "view",
      "name": "随身测记录",
      "url": "/wechat/scale/record"
    }, {
      "type": "view",
      "name": "轻松测",
      "url": "/wechat/tree-game"
    }, {
      "type": "view",
      "name": "推荐医生",
      "url": "/wechat/doctor-vote"
    }/*, {
     "type": "view",
     "name": "游戏成绩",
     "url": ""
     }*/]
  }, {
    "name": "公益商城",
    "sub_button": [/*, {
     "type": "view",
     "name": "赚积分",
     "url": ""
     }*/{
      "type": "view",
      "name": "公益商城",
      "url": "https://weidian.com/s/1142974480",
      "notRedirect": true
    }, {
      "type": "click",
      "name": "签到查积分",
      "key": "get_point"
    }, {
      "type": "click",
      "name": "留言",
      "key": "leave_message"
    }, {
      "type": "view",
      "name": "关于我们",
      "url": "/wechat/about"
    }]
  }]
};
