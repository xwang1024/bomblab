'use strict';

const debug = require('debug')('Pabao:controllers:index');
const Cache = require('../../service/cache');
const Wechat = require('../../service/Wechat');
const config = require('../../config');
// var qrcode = require('../../controllers/admin/qrcode');
// var subscriber = require('../../controllers/common/subscriber');
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
// exports.processWechatEvent = function (req, res, next) {
//   let content = req.body.xml,
//     WechatEvent = req.app.db.models.WechatEvent;
//   new WechatEvent(content).save();
//   console.log('Event received. Event: %s', JSON.stringify(content));
//   let openId = content.FromUserName[0],
//     myId = content.ToUserName[0],
//     createTime = content.CreateTime[0],
//     msgType = content.MsgType[0],
//     msgContent, event, eventKey;

//   //更新用户最后活动时间
//   subscriber.updateActiveTime(req.app, openId);

//   if (msgType === 'text') {
//     //文本消息推送
//     msgContent = (content.Content && content.Content[0]) || '';
//     if (_.startsWith(msgContent, '#')) {
//       msgContent = msgContent.substring(1);
//       leaveMessageEvent();
//     } else if (msgContent === '随意运动') {
//       let msg = `点击☞<a href="${config.serverURL}/wechat/shake-data-obtainer?openId=${openId}">此处进入运动信息采集页面</a>`;
//       wechat.replyText(res.app, openId, myId, msg, function (data) {
//         res.send(data);
//       });
//     } else {
//       return res.send('success');
//     }
//   } else if (msgType === 'event') {
//     //事件推送
//     event = (content.Event && content.Event[0]) || '',
//       eventKey = (content.EventKey && content.EventKey[0]) || '';
//     switch (event) {
//       case 'click':
//       case 'CLICK':
//         clickEvent();
//         break;
//       case 'subscribe':
//         subscribeEvent();
//         break;
//       case 'unsubscribe':
//         unsubscribeEvent();
//         break;
//       case 'scan':
//       case 'SCAN':
//         scanEvent();
//         break;
//       default:
//         return res.send('success');
//     }
//   }

//   function leaveMessageEvent() {
//     let LMR = req.app.db.models.LeaveMessageRecord;
//     new LMR({openId: openId, content: msgContent}).save((err2)=> {
//       let msg = ((err2) ? '留言失败，请稍后重试。' : '感谢您的留言！我们将尽快在常见问题或文章推送中给您答复。');
//       wechat.replyText(res.app, openId, myId, msg, function (data) {
//         res.send(data);
//       });
//     });
//   }

//   function clickEvent() {
//     switch (eventKey) {
//       case 'history_article':
//         debug('Send history articles to %s.', openId);
//         res.setHeader('content-type', 'application/xml');
//         wechat.replyHistoryArticles(req.app, openId, myId, function (data) {
//           res.send(data);
//         }, function (err) {
//           let msg = '查询不到历史文章，请稍后重试';
//           (err === 'NoArticle') && (msg = '暂无历史文章');
//           wechat.replyText(res.app, openId, myId, msg, function (data) {
//             res.send(data);
//           });
//         });
//         break;
//       case 'announcement':
//         debug('Send announcement to %s.', openId);
//         res.setHeader('content-type', 'application/xml');
//         wechat.replyAnnouncements(req.app, openId, myId, function (data) {
//           res.send(data);
//         }, function (err) {
//           let msg = '获取通知公告失败，请稍后重试。';
//           (err === 'NoAnnouncement') && (msg = '当前没有通知公告。');
//           wechat.replyText(res.app, openId, myId, msg, function (data) {
//             res.send(data);
//           });
//         });
//         break;
//       case 'get_point':
//         debug('Send points to %s.', openId);
//         res.setHeader('content-type', 'application/xml');
//         let PR = req.app.db.models.PointRecord;
//         let now = new Date();
//         PR.count().where({
//           openId: openId,
//           eventName: 'sign',
//           date: {$gt: new Date(`${now.getFullYear()}-${now.getMonth() + 1}+${now.getDate()}`)}
//         }).exec((err, num)=> {
//           if (err) {
//             wechat.replyText(res.app, openId, myId, '签到失败，请稍后重试。', function (data) {
//               res.send(data);
//             });
//           } else if (num > 0) {
//             req.app.db.models.Subscriber.findOne({openid: openId}).select('openid point totalPoint').exec((err1, data)=> {
//               if (err1) {
//                 wechat.replyText(res.app, openId, myId, '签到失败，请稍后重试。', function (data) {
//                   res.send(data);
//                 });
//               } else {
//                 wechat.replyText(res.app, openId, myId, `您今天已经签到过了。\n\n当前积分：${data.point || 0}\n总积分  ：${data.totalPoint || 0}`, function (data) {
//                   res.send(data);
//                 });
//               }
//             });
//           } else {
//             subscriber.updatePoint(req.app, openId, 'sign', config.point.sign, (err1, data)=> {
//               if (err1) {
//                 wechat.replyText(res.app, openId, myId, '签到失败，请稍后重试。', function (data) {
//                   res.send(data);
//                 });
//               } else {
//                 wechat.replyText(res.app, openId, myId, `签到成功！获得${config.point.sign}积分。\n\n当前积分：${data.point || 0}\n总积分  ：${data.totalPoint || 0}`, function (data) {
//                   res.send(data);
//                 });
//               }
//             });
//           }
//         });
//         break;
//       case 'leave_message':
//         let msg = '如果您有任何想咨询的问题和给我的建议都可以给我们留言，' +
//           '我们将会在所有的留言中选择一些有价值的问题或建议' +
//           '并尽快在常见问题或文章推送中给您答复。\n\n' +
//           '请您在下方聊天栏中输入“#留言”，例如“#谢谢你们”，即可将留言提交给我们。';
//         wechat.replyText(res.app, openId, myId, msg, function (data) {
//           res.send(data);
//         });
//         break;
//       default:
//         return res.send('success');
//     }
//   }

//   function subscribeEvent() {
//     let Subscriber = req.app.db.models.Subscriber;
//     // if (_.startsWith(eventKey, 'qrscene_')) {
//     //   let sceneStr = eventKey.substring(8);
//     //   qrcode.addSubscribeCount(req.app, sceneStr);
//     //   qrcode.addScanCount(req.app, sceneStr);
//     // }
//     wechat.getSubscriberInfo(req.app, openId, (err, data)=> {
//       if (err) {
//         console.error(`Get user info from wechat error when subscribe. openId: ${openId}`);
//         console.error(err);
//       }
//       Subscriber.findOneAndUpdate({openid: openId}, {
//         openid: openId,
//         subscribe: true,
//         subscribeTime: new Date(data.subscribe_time * 1000),
//         nickname: data.nickname,
//         sex: data.sex,
//         headImgUrl: data.headimgurl,
//         wCity: data.city,
//         wProvince: data.province,
//         wCountry: data.country
//       }, {upsert: 1}, (err)=> {
//         if (err) {
//           console.error(`Save subscriber info to db error when subscribe. openId: ${openId}`);
//           console.error(err);
//         }
//         /*let msg = '新人注册送积分，日常自评得积分；每天十秒轻松测，好文推送同你知！\n\n' +
//          `感谢您关注帕不怕公众号！恭喜您获得了20积分。\n点击此处☞<a href="${wechat.redirectURL('/wechat/user/complete?openId=' + openId)}">完善您的个人信息</a>，可再获得80积分。`;
//          wechat.replyText(res.app, openId, myId, msg, function (data) {
//          res.send(data);
//          });*/
//         let articleIds = ['57e4dd84556946231737d2d0'/*正式*/, '579f12fee2c0ddc413c5724d'/*测试*/];
//         if (articleIds.length <= 0) return replyMsg();
//         wechat.replyNews(res.app, openId, myId, articleIds, (err, data)=> {
//           if (err) {
//             console.error('Reply news error');
//             return replyMsg();
//           }
//           res.send(data);
//         });

//         function replyMsg() {
//           let msg = '新人注册送积分，日常自评得积分；每天十秒轻松测，好文推送同你知！\n\n' +
//             `感谢您关注帕不怕公众号！恭喜您获得了20积分。\n点击此处☞<a href="${wechat.redirectURL('/wechat/user/complete?openId=' + openId)}">完善您的个人信息</a>，可再获得80积分。`;
//           return wechat.replyText(res.app, openId, myId, msg, function (data) {
//             res.send(data);
//           });
//         }
//       });
//     });
//   }

//   function unsubscribeEvent() {
//     let Subscriber = req.app.db.models.Subscriber;
//     Subscriber.findOneAndUpdate({openid: openId}, {subscribe: false}, (err)=> {
//       if (err) {
//         console.error(`Save unsubscriber info to db error when unsubscribe. openId: ${openId}`);
//         console.error(err);
//       } else {
//         debug('Unsubscribe [%s].', openId);
//       }
//       return res.send('success');
//     });
//   }

//   function scanEvent() {
//     // qrcode.addScanCount(req.app, eventKey);
//     return res.send('success');
//   }
// };

