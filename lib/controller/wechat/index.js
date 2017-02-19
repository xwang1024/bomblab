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

      function sendMessages(messageGroup) {
        async.eachSeries(messageGroup, function(message, callback) {
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
      }

      ReplyQueueLog.findOne({ openId, replyQueue: replyQueueId}).exec((err, log) => {
        if(log) {
          let nextIndex = log.clickCount;
          if(nextIndex > log.messageGroupsSnapshot.length-1) {
            nextIndex = log.messageGroupsSnapshot.length-1;
          } else {
            ReplyQueueLog.findByIdAndUpdate(log._id, { clickCount: nextIndex + 1 }, { new: true }).exec();
          }
          sendMessages(log.messageGroupsSnapshot[nextIndex])
        } else {
          ReplyQueue.findById(replyQueueId).exec((err, replyQueue) => {
            new ReplyQueueLog({ openId: openId, replyQueue: replyQueueId, messageGroupsSnapshot: replyQueue.messageGroups, clickCount: 1 }).save();
            sendMessages(replyQueue.messageGroups[0]);
          });
        }
      });
    }
  }
  if(name === 'subscribe') {
    let Subscriber = req.app.db.models.Subscriber;
    Wechat.getSubscriberInfo(openId).then((info) => {
      let newData = {
        openId: info.openid,
        groupId: info.groupid,
        unionId: info.unionid,
        subscribe: info.subscribe ? true : false,
        subscribeTime: new Date(info.subscribe_time * 1000),
        nickname: info.nickname,
        remark: info.remark,
        gender: info.sex,
        headImgUrl: info.headimgurl,
        city: info.city,
        province: info.province,
        country: info.country,
        language: info.language
      };
      Subscriber.findOneAndUpdate({ openId }, newData, { upsert: true }, function(err, doc){
        if (err) return console.log(err);
        console.log(`[WechatController] Subscribe: ${openId}`);
      });
    }).catch((err) => {
      console.log(err);
    })
  }
  if(name === 'unsubscribe') {
    let Subscriber = req.app.db.models.Subscriber;
    let newData = {
      subscribe: false
    };
    Subscriber.findOneAndUpdate({ openId }, newData, { upsert: true }, function(err, doc){
      if (err) return console.log(err);
        console.log(`[WechatController] Unsubscribe: ${openId}`);
    });
  }
}