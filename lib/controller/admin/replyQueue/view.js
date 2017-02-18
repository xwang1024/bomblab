'use strict';

const RenderUtil = require('../../renderUtil');
const Wechat = require('../../../service/Wechat');

exports.index = function(req, res, next) {
  let renderUtil = new RenderUtil(req, res);
  let ReplyQueue = req.app.db.models.ReplyQueue;
  let page = parseInt(req.query.page || 1);
  let pageSize = parseInt(req.query.pageSize || 10);
  let start = (page - 1) * pageSize;
  let end = page * pageSize;

  let countQuery = ReplyQueue.count();
  let query = ReplyQueue.find().skip(start).limit(end - start);
  
  countQuery.exec(function (err, total) {
    if(err) return next(err);
    query.exec(function (err, docs) {
      if(err) return next(err);
      renderUtil.render({
        path: 'admin/replyQueue',
        subTitle: '回复队列管理',
        data: {
          totalCount: total, 
          page: page, 
          pageSize: pageSize, 
          pageCount: Math.ceil(total/pageSize), 
          result: docs
        }
      });
    });
  });
};