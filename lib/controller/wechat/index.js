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
  res.send('success');
  if(!content) return;
  try {
    let fromOpenId = content.FromUserName[0],
        toOpenId   = content.ToUserName[0],
        createTime = content.CreateTime[0],
        event      = content.Event ? content.Event[0] : "",
        eventKey   = content.EventKey ? content.EventKey[0] : "",
        msgType    = content.MsgType[0],
        msgId      = content.MsgID ? content.MsgID[0] : "",
        status     = content.Status ? content.Status[0] : "";

    if(msgType === 'event') {
      const WechatEvent = req.app.db.models.WechatEvent;
      let wechatEvent = new WechatEvent({ event: content });
      wechatEvent.save((err) => {
        if(err) console.error(err, err.stack);
        handleEvent(req, res, fromOpenId, event, eventKey, msgId, status);
      });
    }
  } catch(e) {
    console.error(e, e.stack);
  }
};

function handleEvent(req, res, openId, name, key, msgId, status) {
  name = String(name).toLowerCase();
  if(name === 'click') {
    if(key.indexOf('invitationTask') === 0) {
      let taskId = key.split('-')[1];
      require('../../service/InvitationCard').sendCard(openId, taskId);
    }
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
    let InvitationCard = req.app.db.models.InvitationCard;
    // 获取关注人信息
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
      // 是否为老用户
      Subscriber.findOne({ openId }).exec((err, doc) => {
        if(err) return console.error(err, err.stack);
        if(!doc) { // 不是老用户
          if(key && key.indexOf('qrscene_invitedBy') == 0) {
            let introOpenId = key.substring(18);
            // 寻找介绍人
            Subscriber.findOne({ introOpenId }).exec((err, doc) => {
              if(err) return console.error(err, err.stack);
              if(doc) {
                newData.introducer = doc._id;
              }
              new Subscriber(newData).save((err) => {
                if(err) return console.error(err, err.stack);
                InvitationCard.findOneAndUpdate({ introOpenId }, { $inc: { invitedCount: 1 }}, function(err, doc) {
                  if(err) return console.error(err, err.stack);
                  console.log(`[WechatController] Add Invitation: ${introOpenId}`);
                });
                console.log(`[WechatController] Fresh Subscribe: ${openId}`);
              });
            });
          }
        } else { // 老用户
          
        }
      })
      if(key && k.indexOf('qrscene_invitedBy') == 0) {
      } else {
        Subscriber.findOneAndUpdate({ openId }, newData, { upsert: true }, function(err, doc){
          if(err) return console.log(err);
          console.log(`[WechatController] Subscribe: ${openId}`);
        });
      }
      
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
  if(name === 'templatesendjobfinish') {
    let TemplateSendLog = req.app.db.models.TemplateSendLog;
    status = _.upperFirst(status);
    TemplateSendLog.findOneAndUpdate({ msgId: msgId }, { status : status }, function(err, doc){
      if (err) return console.log(err);
      console.log(`[WechatController] TEMPLATESENDJOBFINISH: ${msgId}`);
    });
  }
}