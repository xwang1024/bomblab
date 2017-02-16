'use strict';

const RenderUtil = require('../../renderUtil');
const Wechat = require('../../../service/Wechat');

exports.index = function(req, res, next) {
  let renderUtil = new RenderUtil(req, res);
  var ReplyQueue = req.app.db.models.ReplyQueue;
  
  ReplyQueue.find({}).populate('asset').exec(function(err, docs) {
    if(!err) {
      renderUtil.render({
        path: 'admin/replyQueue',
        subTitle: '回复队列管理',
        data: { result: docs }
      });
    } else {
      next(err);
    }
  });
};