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


exports.test = function (req, res, next) {
  Wechat.updateAccessToken();
  res.send('Hello');
};

/* 接收来自微信的消息推送 */
exports.processWechatEvent = function (req, res, next) {
  let content = req.body.xml;
  console.log('Event received. Event: %s', JSON.stringify(content));
  let openId = content.FromUserName[0],
    myId = content.ToUserName[0],
    createTime = content.CreateTime[0],
    msgType = content.MsgType[0],
    msgContent, event, eventKey;

  if (msgType === 'text') {
    msgContent = (content.Content && content.Content[0]) || '';
    var debug = msgContent.indexOf('*d**')>0;
    msgContent = msgContent.split('*d**')[0];
    // 查找获取记录
    let Activity = req.app.db.models.Activity;
    let ActivityLog = req.app.db.models.ActivityLog;

    Activity.findOne({hint: msgContent}).populate('asset').exec((err, doc) => {
      if(err) {
        let msg = `服务器出现问题，请稍后重试……`;
        wechat.replyText(res.app, openId, myId, msg, function (data) {
          res.send(data);
        });
      } else if(!doc) {
        let msg = `该活动不存在~请确认您输入的暗号是否正确`;
        wechat.replyText(res.app, openId, myId, msg, function (data) {
          res.send(data);
        });
      } else if(!doc.asset) {
        let msg = `该活动尚未开始，请耐心等待~`;
        wechat.replyText(res.app, openId, myId, msg, function (data) {
          res.send(data);
        });
      } else {
        if(debug) {
          wechat.replyImage(res.app, openId, myId, doc.asset.mediaId, function (data) {
            res.send(data);
          });
        } else {
          ActivityLog.findOne({activity: doc._id, openId: openId}).populate('asset').exec((err, logDoc) => {
            if(err) {
              let msg = `服务器出现问题，请稍后重试……`;
              wechat.replyText(res.app, openId, myId, msg, function (data) {
                res.send(data);
              });
            } else if(!logDoc) {
              var log = new ActivityLog({
                activity: doc._id,
                asset: doc.asset._id,
                openId: openId
              });
              log.save((err, newLogDoc) => {
                if(err) {
                  let msg = `服务器出现问题，请稍后重试……`;
                  wechat.replyText(res.app, openId, myId, msg, function (data) {
                    res.send(data);
                  });
                } else {
                  wechat.replyImage(res.app, openId, myId, doc.asset.mediaId, function (data) {
                    res.send(data);
                  });
                }
              })
            } else {
              wechat.replyImage(res.app, openId, myId, logDoc.asset.mediaId, function (data) {
                res.send(data);
              });
            }
          });
        }
      }
    });
  }
};