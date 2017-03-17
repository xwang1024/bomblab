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
const async = require('async');

setInterval(function() {
  app.db.models.TemplateSendLog.find({ status: 'Pending' }).limit(10).populate('templateMessage subscriber').exec((err, logs) => {
    if(err) return console.log(err);
    if(!logs || !logs.length) return console.log(`Empty Queue.`);
    async.eachSeries(logs, function(log, callback) {
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
}, interval);

console.log(`Started.`);