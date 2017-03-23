'use strict';

const _ = require('lodash');
const Mongo  = require('../../../service/Mongo');
const DB     = Mongo.getClient();
const InvitationTask = DB.models.InvitationTask;

exports.get = function(req, res, next) {
  InvitationTask.find({}).populate('asset').exec(function(err, docs) {
    if(!err) {
      res.send(docs);
    } else {
      next(err);
    }
  });
};

exports.getById = function(req, res, next) {
  const id = req.params.id;
  
  InvitationTask.findById(id).populate('asset').exec(function(err, doc) {
    if(!err) {
      res.send(doc);
    } else {
      next(err);
    }
  });
};

exports.post = function(req, res, next) {
  const task = new InvitationTask(req.body);
  task.save(function(err) {
    if(!err) {
      res.send({success: true});
    } else {
      next(err);
    }
  });
};

exports.put = function(req, res, next) {
  const id = req.params.id;
  InvitationTask.findByIdAndUpdate(id, req.body, {new: true}, function(err, user) {
    if (!err) {
      res.send({success: true});
    } else {
      next(err);
    }
  });
};

exports.delete = function(req, res, next) {
  const id = req.params.id;
  InvitationTask.remove({ _id: id }, function(err) {
    if (!err) {
      res.send({success: true});
    } else {
      next(err);
    }
  });
};