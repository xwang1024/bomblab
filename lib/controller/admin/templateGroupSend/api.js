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

  function makeRecord(templateMessageId, subscriberId, status, msgId) {
    new TemplateSendLog({
      templateMessage: templateMessageId,
      subscriber: subscriberId,
      status: status,
      msgId: msgId
    }).save();
  }
  TemplateMessage.findById(id).exec((err, templateMessage) => {
    if(err) return next(err);
    Subscriber.find({ subscribe: true }).exec((err, subscribers) => {
      if(err) return next(err);
      async.eachSeries(subscribers, function(subscriber, callback) {
        Wechat.sendTemplateMessage(subscriber.openId, templateMessage.templateId, templateMessage.url, templateMessage.data).then((data) => {
          makeRecord(templateMessage._id, subscriber._id, 'Sending', data.msgid+'');
          callback();
        }).catch((err) => {
          makeRecord(templateMessage._id, subscriber._id, err.message || 'Unknown error');
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

