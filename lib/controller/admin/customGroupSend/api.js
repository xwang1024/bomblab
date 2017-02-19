'use strict';

const _ = require('lodash');
const mongoose = require('mongoose');

exports.get = function(req, res, next) {
  let id = req.params.id;
  let CustomMessageGroup = req.app.db.models.CustomMessageGroup;
  CustomMessageGroup.findById(id).exec(function(err, doc) {
    if(!err) {
      res.send(doc);
    } else {
      next(err);
    }
  });
};

exports.post = function(req, res, next) {
  let CustomMessageGroup = req.app.db.models.CustomMessageGroup;
  let group = new CustomMessageGroup(req.body);
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
  let CustomMessageGroup = req.app.db.models.CustomMessageGroup;
  delete req.body._id;
  CustomMessageGroup.findByIdAndUpdate(id, req.body, {new: true}, function(err, user) {
    if (!err) {
      res.send({success: true});
    } else {
      next(err);
    }
  });
};

exports.send = function(req, res, next) {
  let id = req.params.id;
  let CustomMessageGroup = req.app.db.models.CustomMessageGroup;
  res.send({ success: true });
};

exports.delete = function(req, res, next) {
  let id = req.params.id;
  let CustomMessageGroup = req.app.db.models.CustomMessageGroup;

  CustomMessageGroup.remove({ _id: id }, function(err) {
    if (!err) {
      res.send({success: true});
    } else {
      next(err);
    }
  });
};

