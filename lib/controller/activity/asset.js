'use strict';

const _ = require('lodash');
const mongoose = require('mongoose');

exports.get = function(req, res, next) {
  var activityId = req.params.id;
  var Asset = req.app.db.models.Asset;
  var Activity = req.app.db.models.Activity;
  var ActivityLog = req.app.db.models.ActivityLog;

  Activity.findById(activityId).populate('asset').exec(function(err, activity) {
    if(err) {
      next(err);
    } else {
      Asset.find({activity: activityId}).sort({_id: -1}).exec(function(err, docs) {
        if(err) {
          next(err);
        } else {
          var result = docs.map((doc) => {
            let item = doc.toJSON();
            item.url = 'http://' + req.app.config.qiniu.domain + '/' + item.key + '?imageView2/1/w/128/h/128/format/jpg/q/80'
            return item;
          });

          ActivityLog.aggregate([
            { $match: {activity: new mongoose.Types.ObjectId(activityId)} },
            { $group: {_id: '$asset', total: { "$sum": 1 } }},
            { $sort: { "total": -1 } }
          ]).exec(function(err, stat) {
            if(err) {
              next(err);
            } else {
              Asset.populate(stat, {path: "_id"}, function(err, popedStat) {
                if(err) {
                  next(err);
                } else {
                  res.render('activity/list/asset', {_DATA_: {activity: activity, result: result, stat: popedStat }, _PARAMS_: req.params});
                }
              });
            }
          });
          
        }
      });
    }
  });
  
  
};
