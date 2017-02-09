'use strict';

const RenderUtil = require('../../render-util');

exports.view = function(req, res, next) {
  let { id } = req.params;
  let { openId } = req.query;
  const renderUtil = new RenderUtil(req, res);
  const Asset = req.app.db.models.Asset;
  const Activity = req.app.db.models.Activity;
  const ActivityLog = req.app.db.models.ActivityLog;

  Activity.findById(id).populate('asset').exec((err, doc) => {
    if(err) return res.redirect('/wechat-500.html');

    if(!doc) {
      return res.redirect('/wechat-404.html');
    } else if(!doc.asset) {
      return res.redirect('/wechat-404.html');
    } else {
      ActivityLog.findOne({activity: doc._id, openId: openId}).populate('asset').exec((err, logDoc) => {
        if(err) {
          return res.redirect('/wechat-500.html');
        } else if(!logDoc) {
          var log = new ActivityLog({
            activity: doc._id,
            asset: doc.asset._id,
            openId: openId
          });
          log.save((err, newLogDoc) => {
            if(err) {
              return res.redirect('/wechat-500.html');
            } else {
              return res.redirect(`/asset/${doc.asset.key}`);
            }
          });
        } else {
          return res.redirect(`/asset/${logDoc.asset.key}`);
        }
      });
    }
  });
};