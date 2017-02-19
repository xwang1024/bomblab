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

const timeWindowSize = 5000;
const async = require('async');

setInterval(function() {
  console.log('[Timer] SubscriberReply');
  let now = Date.now();
  app.db.models.SubscribeReply.find().sort('waitMinutes').exec((err, replies) => {
    console.log('[Timer] Replies count: ' + replies.length)
    replies.forEach((reply) => {
      let end = now - reply.waitMinutes*60*1000;
      let start = end - timeWindowSize;
      app.db.models.Subscriber.find({ subscribe: true, subscribeTime: {$gt: start, $lt: end}}).exec((err, subscribers) => {
        console.log(`[Timer] Subscribers (${reply.waitMinutes} Min): ` + subscribers.map((e) => (e.openId)));
        subscribers.forEach((subscriber) => {
          async.eachSeries(reply.messages, function(message, callback) {
            if(message.type === 'text') {
              return Wechat.sendText(subscriber.openId, message.content).then((data) => {
                setTimeout(callback, 1000);
              }).catch(callback);
            }
            if(message.type === 'image') {
              return Wechat.sendImage(subscriber.openId, message.mediaId).then((data) => {
                setTimeout(callback, 5000);
              }).catch(callback);
            }
          }, function(err) {
            err && console.log(err);
          });
        })
      });
    });
  }); 
}, timeWindowSize/2)
