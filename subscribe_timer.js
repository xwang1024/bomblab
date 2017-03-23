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

  const timeWindowSize = 5000;
  const async = require('async');

  setInterval(function() {
    let now = Date.now();
    app.db.models.SubscribeReply.find().sort('waitMinutes').exec((err, replies) => {
      if(err) return console.error(err);
      console.log('Replies count: ' + replies.length)
      replies.forEach((reply) => {
        let end = now - reply.waitMinutes*60*1000;
        let start = end - timeWindowSize;
        app.db.models.Subscriber.find({ subscribe: true, subscribeTime: {$gt: start, $lt: end}}).exec((err, subscribers) => {
          if(err) return console.error(err);
          console.log(`Subscribers (${reply.waitMinutes} Min): ` + subscribers.map((e) => (e.openId)));
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
              err && console.error(err);
            });
          })
        });
      });
    }); 
  }, timeWindowSize-1000);

  console.log(`Started.`);
});