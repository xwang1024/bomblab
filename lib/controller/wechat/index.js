'use strict';

const debug = require('debug')('Pabao:controllers:index');
const Cache = require('../../service/Cache');
const Wechat = require('../../service/Wechat');
const config = require('../../config');
const _ = require('lodash');

/* 微信公众平台连接认证 */
exports.wechatValidation = function (req, res, next) {
  let signature = req.query.signature;
  let timestamp = req.query.timestamp;
  let nonce = req.query.nonce;
  let echostr = req.query.echostr;
  let flag = Wechat.validateSignature(signature, timestamp, nonce);
  if (flag) return res.send(echostr);
  else return res.send({success: false});
};

/* 更新access token */
exports.updateAccessToken = function (req, res, next) {
  Wechat.updateAccessToken();
  res.send('updateAccessToken');
};

/* 接收来自微信的消息推送 */
exports.processWechatEvent = function (req, res, next) {
  let content = req.body.xml;
  console.log('Event received. Event: %s', JSON.stringify(content));
  let fronOpenId = content.FromUserName[0],
      toOpenId   = content.ToUserName[0],
      createTime = content.CreateTime[0],
      msgType    = content.MsgType[0],
      msgContent, event, eventKey;

  res.send("");
};