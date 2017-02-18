'use strict';

const _ = require('lodash');
const mongoose = require('mongoose');

exports.get = function(req, res, next) {
  let ReplyQueue = req.app.db.models.ReplyQueue;
  
  ReplyQueue.find({}).populate('asset').exec(function(err, docs) {
    if(!err) {
      res.send(docs);
    } else {
      next(err);
    }
  });
};

exports.getById = function(req, res, next) {
  let id = req.params.id;
  let ReplyQueue = req.app.db.models.ReplyQueue;
  
  ReplyQueue.findById(id).populate('asset').exec(function(err, doc) {
    if(!err) {
      res.send(doc);
    } else {
      next(err);
    }
  });
};

exports.post = function(req, res, next) {
  let ReplyQueue = req.app.db.models.ReplyQueue;
  let replyQueue = new ReplyQueue(req.body);
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
  let ReplyQueue = req.app.db.models.ReplyQueue;
  
  ReplyQueue.findByIdAndUpdate(id, req.body, {new: true}, function(err, user) {
    if (!err) {
      res.send({success: true});
    } else {
      next(err);
    }
  });
};

exports.delete = function(req, res, next) {
  let id = req.params.id;
  let ReplyQueue = req.app.db.models.ReplyQueue;

  ReplyQueue.remove({ _id: id }, function(err) {
    if (!err) {
      res.send({success: true});
    } else {
      next(err);
    }
  });
};

