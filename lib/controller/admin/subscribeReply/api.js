'use strict';

const _ = require('lodash');
const mongoose = require('mongoose');

exports.get = function(req, res, next) {
  let id = req.params.id;
  let SubscribeReply = req.app.db.models.SubscribeReply;
  SubscribeReply.findById(id).exec(function(err, doc) {
    if(!err) {
      res.send(doc);
    } else {
      next(err);
    }
  });
};

exports.post = function(req, res, next) {
  let SubscribeReply = req.app.db.models.SubscribeReply;
  let replyQueue = new SubscribeReply(req.body);
  replyQueue.save(function(err) {
    if(!err) {
      res.send({success: true});
    } else {
      next(err);
    }
  });
};

exports.put = function(req, res, next) {
  let id = req.params.id;
  let SubscribeReply = req.app.db.models.SubscribeReply;
  
  SubscribeReply.findByIdAndUpdate(id, req.body, {new: true}, function(err, user) {
    if (!err) {
      res.send({success: true});
    } else {
      next(err);
    }
  });
};

exports.delete = function(req, res, next) {
  let id = req.params.id;
  let SubscribeReply = req.app.db.models.SubscribeReply;

  SubscribeReply.remove({ _id: id }, function(err) {
    if (!err) {
      res.send({success: true});
    } else {
      next(err);
    }
  });
};

