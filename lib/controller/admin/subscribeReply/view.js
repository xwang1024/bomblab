'use strict';

const RenderUtil = require('../../renderUtil');
const Wechat = require('../../../service/Wechat');

exports.index = function(req, res, next) {
  let renderUtil = new RenderUtil(req, res);
  var SubscribeReply = req.app.db.models.SubscribeReply;
  
  SubscribeReply.find({}).sort('waitMinutes').exec(function(err, docs) {
    if(!err) {
      renderUtil.render({
        path: 'admin/subscribeReply',
    subTitle: '关注定时回复',
        data: { result: docs }
      });
    } else {
      next(err);
    }
  });
};