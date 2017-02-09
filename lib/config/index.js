'use strict';

exports.cluster = false;
exports.workerNum = 1;

exports.port = process.env.PORT || '3000';

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

exports.mongodb = {
  uri: process.env.MONGOLAB_URI || process.env.MONGOHQ_URL || 'mongodb://localhost:27017/hs_creative'
};

exports.cryptoKey = 'o9fnnr4ost7';
exports.loginAttempts = {
  forIp: 50,
  forIpAndUser: 7,
  logExpiration: '20m'
};

exports.qiniu = {
  ACCESS_KEY: "yWrPcgLpkuqKQeL0FH1sYr8jJTTqF6aS5unIlXGN",
  SECRET_KEY: "_cleIwO0d1OARv1pVLMvkIpd-Eq9ELy5o5UvN225",
  domain: "ohq2w7iao.bkt.clouddn.com",
  bucketName: "hs-creative"
}

exports.xiumi = {
  email: "894584601@qq.com",
  password: "doudou123",
  appid: "4fcc9b89c7235d7d59ede856336031d7f055c64a46c67585db811f4b9eb06764",
  sid: "2wghB"
}