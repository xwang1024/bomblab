'use strict';

const _ = require('lodash');
const Wechat = require('../../../service/Wechat');
const mongoose = require('mongoose');
const async = require('async');

exports.get = function(req, res, next) {
  let id = req.params.id;
  let TemplateMessage = req.app.db.models.TemplateMessage;
  TemplateMessage.findById(id).exec(function(err, doc) {
    if(!err) {
      res.send(doc);
    } else {
      next(err);
    }
  });
};

exports.post = function(req, res, next) {
  let TemplateMessage = req.app.db.models.TemplateMessage;
  let group = new TemplateMessage(req.body);
  group.save(function(err) {
    if(!err) {
      res.send({success: true});
    } else {
      next(err);
    }
  });
};

exports.put = function(req, res, next) {
  let id = req.params.id;
  let TemplateMessage = req.app.db.models.TemplateMessage;
  delete req.body._id;
  TemplateMessage.findByIdAndUpdate(id, req.body, {new: true}, function(err, user) {
    if (!err) {
      res.send({success: true});
    } else {
      next(err);
    }
  });
};

exports.send = function(req, res, next) {
  let id = req.params.id;
  let TemplateMessage = req.app.db.models.TemplateMessage;
  let TemplateSendLog = req.app.db.models.TemplateSendLog;
  let Subscriber = req.app.db.models.Subscriber;

  function makeRecord(customMessageGroupId, subscriberId, status) {
    new TemplateSendLog({
      customMessageGroup: customMessageGroupId,
      subscriber: subscriberId,
      status: status
    }).save();
  }
  CustomMessageGroup.findById(id).exec((err, messageGroup) => {
    if(err) return next(err);
    Subscriber.find({ subscribe: true }).exec((err, subscribers) => {
      if(err) return next(err);
      async.each(subscribers, function(subscriber, callback) {
        async.eachSeries(messageGroup.messages, function(message, subCallback) {
          if(message.type === 'text') {
            return Wechat.sendText(subscriber.openId, message.content).then((data) => {
              console.log('[GroupSend] ' + subscriber.openId, data);
              setTimeout(subCallback, 1000);
            }).catch(subCallback);
          }
          if(message.type === 'image') {
            return Wechat.sendImage(subscriber.openId, message.mediaId).then((data) => {
              console.log('[GroupSend] ' + subscriber.openId, data);
              setTimeout(subCallback, 5000);
            }).catch(subCallback);
          }
        }, function(err) {
          let status = 'Success';
          if(err) {
            status = err.message || 'Unknown error';
          }
          makeRecord(messageGroup._id, subscriber._id, status);
          callback();
        });
      }, function(err) {
        if(err) return next(err);
        res.send({ success: true });
      });
    })
  });
};

exports.delete = function(req, res, next) {
  let id = req.params.id;
  let TemplateMessage = req.app.db.models.TemplateMessage;

  TemplateMessage.remove({ _id: id }, function(err) {
    if (!err) {
      res.send({success: true});
    } else {
      next(err);
    }
  });
};

