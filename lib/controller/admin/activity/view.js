'use strict';

const RenderUtil = require('../../renderUtil');

exports.index = function(req, res, next) {
  let renderUtil = new RenderUtil(req, res);
  var Activity = req.app.db.models.Activity;
  
  Activity.find({}).populate('asset').exec(function(err, docs) {
    if(!err) {
      renderUtil.render({
        path: 'admin/activity/list',
        subTitle: '扫码返图',
        data: { result: docs }
      });
    } else {
      next(err);
    }
  });
};