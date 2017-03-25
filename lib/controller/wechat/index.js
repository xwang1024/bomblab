'use strict';

const debug = require('debug')('WechatController');
const EventEmitter = require('events').EventEmitter;
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
        status     = content.Status ? content.Status[0] : "",
        ticket     = content.Ticket ? content.Ticket[0] : null;

    if(msgType === 'event') {
      const WechatEvent = req.app.db.models.WechatEvent;
      let wechatEvent = new WechatEvent({ event: content });
      wechatEvent.save((err) => {
        if(err) console.error(err, err.stack);
        handleEvent(req, res, fromOpenId, event, eventKey, msgId, status, ticket);
      });
    }
  } catch(e) {
    console.error(e, e.stack);
  }
};

function handleEvent(req, res, openId, name, key, msgId, status, ticket) {
  const Subscriber = req.app.db.models.Subscriber;
  const InvitationCard = req.app.db.models.InvitationCard;

  name = String(name).toLowerCase();

  if(name === 'scan') {
    if(ticket) {
      InvitationCard.findOne({ qrTicket: ticket }).populate('invitationTask').exec((err, cardDoc) => {
        if(err) return console.error(err);
        if(cardDoc && cardDoc.invitationTask.status === 'OPEN') {
          if(cardDoc.openId === openId) {
             return Wechat.sendText(openId, "你不能扫描自己的任务卡");
          } else {
            Subscriber.findOne({ openId, subscribe: true }).exec((err, subscriberDoc) => {
              if(err) return console.error(err);
              if(subscriberDoc) return Wechat.sendText(openId, "你已经关注，不能被邀请");
            });
          }
        }
      });
    }
  }
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
    const workflow = new EventEmitter();
    let introducer = null;
    let card = null;

    // 检查扫码标记
    workflow.on('checkTicket', () => {
      debug('Event: checkTicket');
      if(ticket) return workflow.emit('findNewUser'); // 在数据库中寻找该"新"用户
      return workflow.emit('getSubscriberInfo'); // 获得"新"用户详情
    });

    // 在数据库中寻找该用户
    workflow.on('findNewUser', () => {
      debug('Event: findNewUser');
      Subscriber.findOne({ openId }).exec((err, doc) => {
        if(err) return workflow.emit('error', err); // 错误
        if(!doc) return workflow.emit('getTaskAndCard'); // 查找邀请卡和任务配置
        InvitationCard.findOne({ openId, qrTicket: ticket }).exec((err, selfScanedCardDoc) => {
          if(err) return workflow.emit('error', err); // 错误
          if(selfScanedCardDoc) return Wechat.sendText(openId, "你不能扫描自己的任务卡");
          if(doc.subscribe) return Wechat.sendText(openId, "你已经关注，不能被邀请");
          Wechat.sendText(openId, "你已经被邀请过，不能被再次邀请");
        });
        return workflow.emit('getSubscriberInfo'); // 获得"新"用户详情
      });
    });

    workflow.on('getTaskAndCard', () => {
      debug('Event: getTaskAndCard');
      InvitationCard.findOne({ qrTicket: ticket }).populate('invitationTask').exec((err, cardDoc) => {
        if(err) return workflow.emit('error', err); // 错误
        if(!cardDoc) return workflow.emit('getSubscriberInfo'); // 没有此邀请卡，获得"新"用户详情
        if(!cardDoc.invitationTask) return workflow.emit('getSubscriberInfo'); // 邀请卡任务不存在，获得"新"用户详情
        if(cardDoc.invitationTask.status !== 'OPEN') return workflow.emit('getSubscriberInfo'); // 邀请卡任务已关闭，获得"新"用户详情
        card = cardDoc.toJSON();
        Subscriber.findOne({ openId: cardDoc.openId }).exec((err, introducerDoc) => {
          if(err) return workflow.emit('error', err); // 错误
          if(!introducerDoc) return workflow.emit('getSubscriberInfo'); // 没有此邀请人，获得"新"用户详情
          introducer = introducerDoc.toJSON();
          return workflow.emit('invitedCountPlus'); // 增加邀请量
        });
      });
    });

    workflow.on('invitedCountPlus', () => {
      debug('Event: invitedCountPlus');
      InvitationCard.findOneAndUpdate({ qrTicket: ticket }, { $inc: { invitedCount: 1 }}, function(err, doc) {
        if(err) return workflow.emit('error', err); // 错误
        console.log(`[WechatController] Add Invitation: ${ticket}`);
        workflow.emit('getSubscriberInfo');
      });
    });

    workflow.on('getSubscriberInfo', () => {
      debug('Event: getSubscriberInfo');
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
        if(introducer) {
          newData.introducer = introducer._id;
          if(card.invitationTask.invitedFeedback) {
            let invitedCount = card.invitedCount + 1;
            let remainCount = card.invitationTask.threshold - invitedCount;
            let invitedFeedback = card.invitationTask.invitedFeedback;
            if(remainCount > 0) {
              invitedFeedback = invitedFeedback.replace(/###/g, info.nickname)
              invitedFeedback = invitedFeedback.replace(/#invited#/g, invitedCount + '');
              invitedFeedback = invitedFeedback.replace(/#remain#/g, remainCount + '')
              Wechat.sendText(introducer.openId, invitedFeedback);
            }
          }
        }
        Subscriber.findOneAndUpdate({ openId }, newData, { upsert: true }, function(err, doc){
          if(err) return workflow.emit('error', err); // 错误
          console.log(`[WechatController] New Subscriber: ${openId}`);
        });
      }).catch((err) => {
        if(err) return workflow.emit('error', err); // 错误
      })
    });

    // 错误
    workflow.on('error', (err, wechatMessage) => {
      debug('Event: error');
      if(err) {
        console.error(err, err.stack);
      } else {
        console.error('Undefined Error Event');
      }
    });

    workflow.emit('checkTicket');
  }
  if(name === 'unsubscribe') {
    let Subscriber = req.app.db.models.Subscriber;
    let newData = {
      subscribe: false
    };
    Subscriber.findOneAndUpdate({ openId }, newData, { upsert: true }, function(err, doc){
      if (err) return console.error(err);
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