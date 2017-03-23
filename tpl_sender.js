'use strict';

require('./lib/polyfill');

const path       = require('path');
const morgan     = require('morgan');
const mongoose   = require('mongoose');

const config = require('./lib/config');
const Cache  = require('./lib/service/Cache');
const Wechat = require('./lib/service/Wechat');

Cache.init(config.redis);
Wechat.init(config.wechat);

const app = {};
app.config = config;

const Mongo  = require('./lib/service/Mongo');
Mongo.getClient(config.mongodb).then((mongoClient) => {
  app.db = mongoClient;
  require('./lib/model')(app, mongoose);

  const interval = 5000;
  const limitCount = 10;
  const async = require('async');
  const LogModel = app.db.models.TemplateSendLog;

  setInterval(function() {
    // 检查队列中是否仍有 Queuing 任务，有则跳过该次循环
    LogModel.count({ status: 'Queuing' }).exec((err, count) => {
      if(err) return console.error(err);
      if(count > 0) return console.log(`Already Queuing: ${count}`);
      // 取出 limitCount 条 Pending 的任务，改为 Queuing
      LogModel.find({ status: 'Pending' }).populate('templateMessage subscriber').limit(limitCount).exec((err, logs) => {
        if(err) return console.error(err);
        if(!logs || !logs.length) return console.log(`Empty Queue.`);
        // 将取出 logs 的状态改为 Queuing
        LogModel.update({ _id: { $in: logs.map((log) => (log._id)) } }, { status: 'Queuing' }, { multi: true }).exec((err) => {
          if(err) return console.error(err);
          // 只有 10 条，并行发送
          async.each(logs, function(log, callback) {
            console.log(`Send Template Message: OpenId=${log.subscriber.openId} tplId=${log.templateMessage.templateId}`);
            Wechat.sendTemplateMessage(
              log.subscriber.openId, 
              log.templateMessage.templateId, 
              log.templateMessage.url, 
              log.templateMessage.data
            ).then((data) => {
              log.status = 'Sending';
              log.msgId = String(data.msgid);
              log.save(callback);
            }).catch((err) => {
              log.status = err.message || 'Unknown error';
              log.save(callback);
            });
          }, function(err) {
            if(err) {
              console.error(`Error: ${err}`);
              console.error(err && err.stack);
            } else {
              console.log(`Send: ${logs.length}`);
            }
          });
        });
      });
    });
  }, interval);

  console.log(`Started.`);
});