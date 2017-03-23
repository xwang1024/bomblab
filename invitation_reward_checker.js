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

  const interval = 10000;
  const limitCount = 10;
  const async = require('async');
  const InvitationTask = app.db.models.InvitationTask;
  const InvitationCard = app.db.models.InvitationCard;

  setInterval(function() {
    InvitationTask.find({ status: 'OPEN' }).exec((err, taskDocs) => {
      if(err) return console.error(err);
      if(!taskDocs || !taskDocs.length) return;
      async.eachSeries(taskDocs, (taskDoc, callback) => {
        InvitationCard.find({ invitationTask: taskDoc._id, isRewardSended: false, invitedCount: { $gte: taskDoc.threshold } }).exec((err, cardDocs) => {
          cardDocs.forEach((cardDoc) => {
            Wechat.sendTemplateMessage(
              cardDoc.openId, 
              taskDoc.rewardMessageSetting.templateId, 
              taskDoc.rewardMessageSetting.url, 
              taskDoc.rewardMessageSetting.data
            ).then(() => {
              cardDoc.isRewardSended = true;
              cardDoc.save((err) => {
                if(err) return console.error(err);
                console.log('Reward Message Sended: ' + cardDoc.openId);
              });
            }).catch((err) => {
              if(err) return console.error(err);
            });
            callback();
          });
        });
      }, (err) => {
        if(err) return console.error(err);
      });
    });
  }, interval);

  console.log(`Started.`);
});