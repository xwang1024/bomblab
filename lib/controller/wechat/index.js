'use strict';

const debug = require('debug')('Pabao:controllers:wechat:index');
const Cache = require('../../service/Cache');
const Wechat = require('../../service/Wechat');
const config = require('../../config');
const _ = require('lodash');
const async = require('async');

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
  let fromOpenId = content.FromUserName[0],
      toOpenId   = content.ToUserName[0],
      createTime = content.CreateTime[0],
      msgType    = content.MsgType[0];

  if(msgType === 'event') {
    res.send('');
    handleEvent(fromOpenId, content.Event[0], content.EventKey[0], req, res);
  } else {
    res.send('');
  }
};

function handleEvent(openId, name, key, req, res) {
  if(name === 'CLICK') {
    if(key.indexOf('message') === 0) {
      let replyQueueId = key.split('-')[1];
      let ReplyQueue = req.app.db.models.ReplyQueue;
      let ReplyQueueLog = req.app.db.models.ReplyQueueLog;
      ReplyQueue.findById(replyQueueId).exec((err, replyQueue) => {
        ReplyQueueLog.findOne({ openId: openId, replyQueue: replyQueueId}).exec((err, log) => {
          let nextIndex = 0;
          if(log) {
            nextIndex = log.clickCount + 1;
            if(nextIndex > replyQueue.messageGroups.length-1) {
              nextIndex = replyQueue.messageGroups.length-1;
            } else {
              ReplyQueueLog.findByIdAndUpdate(log._id, { clickCount: nextIndex }, { new: true }).exec();
            }
          } else {
            new ReplyQueueLog({ openId: openId, replyQueue: replyQueueId }).save();
          }
          async.eachSeries(replyQueue.messageGroups[nextIndex], function(message, callback) {
            if(message.type === 'text') {
              return Wechat.sendText(openId, message.content).then((data) => {
                setTimeout(callback, 1000);
              }).catch(callback);
            }
            if(message.type === 'image') {
              return Wechat.sendImage(openId, message.mediaId).then((data) => {
                setTimeout(callback, 5000);
              }).catch(callback);
            }
          }, function(err) {
            err && console.log(err);
          });
        });
      });
    }
  }
}