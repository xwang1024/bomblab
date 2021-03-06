'use strict';

const RenderUtil = require('../../renderUtil');
const Wechat = require('../../../service/Wechat');

exports.index = function(req, res, next) {
  let renderUtil = new RenderUtil(req, res);
  let CustomMessageGroup = req.app.db.models.CustomMessageGroup;
  let page = parseInt(req.query.page || 1);
  let pageSize = parseInt(req.query.pageSize || 10);
  let start = (page - 1) * pageSize;
  let end = page * pageSize;

  let countQuery = CustomMessageGroup.count();
  let query = CustomMessageGroup.find().sort({ createdAt: -1 }).skip(start).limit(end - start);
  
  countQuery.exec(function (err, total) {
    if(err) return next(err);
    query.exec(function (err, docs) {
      if(err) return next(err);
      renderUtil.render({
        path: 'admin/customGroupSend',
        subTitle: '客服消息群发',
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

exports.log = function(req, res, next) {
  let renderUtil = new RenderUtil(req, res);
  let CustomSendLog = req.app.db.models.CustomSendLog;
  let customMessageGroupId = req.params.id;
  let page = parseInt(req.query.page || 1);
  let pageSize = parseInt(req.query.pageSize || 50);
  let start = (page - 1) * pageSize;
  let end = page * pageSize;

  let countQuery = CustomSendLog.count({ customMessageGroup: customMessageGroupId });
  let query = CustomSendLog.find({ customMessageGroup: customMessageGroupId }).populate('customMessageGroup').populate('subscriber').skip(start).limit(end - start).sort({status: 1});
  
  countQuery.exec(function (err, total) {
    if(err) return next(err);
    query.exec(function (err, docs) {
      if(err) return next(err);
      renderUtil.render({
        path: 'admin/customGroupSend/log',
        subTitle: '客服消息群发日志',
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