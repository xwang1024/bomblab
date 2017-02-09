'use strict';

const _ = require('lodash');
const mongoose = require('mongoose');

exports.getStat = function(req, res, next) {
  let activityId = req.params.id;
  let Asset = req.app.db.models.Asset;
  let Activity = req.app.db.models.Activity;
  let ActivityLog = req.app.db.models.ActivityLog;

  ActivityLog.aggregate([
    { $match: {activity: new mongoose.Types.ObjectId(activityId)} },
    { $group: {_id: '$asset', total: { "$sum": 1 }, lastUsedAt: { "$max": "$createdAt" } }},
    { $sort: { "_id": -1 } }
  ]).exec(function(err, stat) {
    if(err) {
      next(err);
    } else {
      Asset.populate(stat, {path: "_id"}, function(err, popedStat) {
        if(err) {
          next(err);
        } else {
          res.send({stat: popedStat});
        }
      });
    }
  });
};

exports.post = function(req, res, next) {
  let Activity = req.app.db.models.Activity;
  let activity = new Activity(req.body);
  activity.save(function(err) {
    if(!err) {
      res.send({success: true});
    } else {
      next(err);
    }
  });
};

exports.put = function(req, res, next) {
  let id = req.params.id;
  let Activity = req.app.db.models.Activity;
  
  Activity.findByIdAndUpdate(id, req.body, {new: true}, function(err, user) {
    if (!err) {
      res.send({success: true});
    } else {
      next(err);
    }
  });
};

exports.delete = function(req, res, next) {
  let id = req.params.id;
  let Activity = req.app.db.models.Activity;

  Activity.remove({ _id: id }, function(err) {
    if (!err) {
      res.send({success: true});
    } else {
      next(err);
    }
  });
};

