'use strict';

require('./lib/polyfill');

const path       = require('path');
const morgan     = require('morgan');
const mongoose   = require('mongoose');

const config = require('./lib/config');
const Cache  = require('./lib/service/Cache');
const Wechat = require('./lib/service/Wechat');

const app = {};
app.config = config;

// init mongodb connection
mongoose.Promise = global.Promise;
app.db = mongoose.createConnection(config.mongodb.uri);
app.db.on('error', console.error.bind(console, 'mongoose connection error: '));
app.db.once('open', function () { /* ... */ });
require('./lib/model')(app, mongoose);

Cache.init(config.redis);
Wechat.init(config.wechat);

const interval = 5000;
const limitCount = 10;
const async = require('async');
const LogModel = app.db.models.TemplateSendLog;

setInterval(function() {
  // 检查队列中是否仍有 Queuing 任务，有则跳过该次循环
  LogModel.count({ status: 'Queuing' }).exec((err, count) => {
    if(err) return console.log(err);
    if(count > 0) return console.log(`Already Queuing: ${count}`);
    // 取出 limitCount 条 Pending 的任务，改为 Queuing
    LogModel.find({ status: 'Pending' }).populate('templateMessage subscriber').limit(limitCount).exec((err, logs) => {
      if(err) return console.log(err);
      if(!logs || !logs.length) return console.log(`Empty Queue.`);
      // 将取出 logs 的状态改为 Queuing
      LogModel.update({ _id: { $in: logs.map((log) => (log._id)) } }, { status: 'Queuing' }, { multi: true }).exec((err) => {
        if(err) return console.log(err);
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