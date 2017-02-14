'use strict';

const _ = require('lodash');
const mongoose = require('mongoose');
const RenderUtil = require('../../../renderUtil');

exports.index = function(req, res, next) {
  let renderUtil = new RenderUtil(req, res);
  let activityId = req.params.id;
  let Asset = req.app.db.models.Asset;
  let Activity = req.app.db.models.Activity;
  let ActivityLog = req.app.db.models.ActivityLog;

  Activity.findById(activityId).populate('asset').exec(function(err, activity) {
    if(err) {
      next(err);
    } else {
      Asset.find({activity: activityId}).sort({_id: -1}).exec(function(err, docs) {
        if(err) {
          next(err);
        } else {
          let result = docs.map((doc) => {
            let item = doc.toJSON();
            item.url = 'http://' + req.app.config.qiniu.domain + '/' + item.key
            return item;
          });

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
                  renderUtil.render({
                    path: 'admin/activity/list/asset',
                    subTitle: activity.name + ' - 图片管理',
                    data: {activity: activity, result: result, stat: popedStat }
                  });
                }
              });
            }
          });
          
        }
      });
    }
  });
};