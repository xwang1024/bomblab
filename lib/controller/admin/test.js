'use strict';

const _ = require('lodash');
const Wechat = require('../../service/Wechat');
const mongoose = require('mongoose');
const async = require('async');

exports.index = function(req, res, next) {
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
      res.send({ subscribe_length: subscribers.length });
    })
  });
};