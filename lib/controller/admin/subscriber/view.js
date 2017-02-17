'use strict';

const RenderUtil = require('../../renderUtil');
const Wechat = require('../../../service/Wechat');

exports.index = function(req, res, next) {
  let renderUtil = new RenderUtil(req, res);
  var Subscriber = req.app.db.models.Subscriber;
  
  Subscriber.find({}).exec(function(err, docs) {
    if(!err) {
      renderUtil.render({
        path: 'admin/subscriber',
        subTitle: '订阅者管理',
        data: { result: docs }
      });
    } else {
      next(err);
    }
  });
};