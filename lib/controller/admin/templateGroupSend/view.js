'use strict';

const RenderUtil = require('../../renderUtil');
const Wechat = require('../../../service/Wechat');

exports.index = function(req, res, next) {
  let renderUtil = new RenderUtil(req, res);
  let TemplateMessage = req.app.db.models.TemplateMessage;
  let page = parseInt(req.query.page || 1);
  let pageSize = parseInt(req.query.pageSize || 10);
  let start = (page - 1) * pageSize;
  let end = page * pageSize;

  let countQuery = TemplateMessage.count();
  let query = TemplateMessage.find().sort({ createdAt: -1 }).skip(start).limit(end - start);
  
  countQuery.exec(function (err, total) {
    if(err) return next(err);
    query.exec(function (err, docs) {
      if(err) return next(err);
      renderUtil.render({
        path: 'admin/templateGroupSend',
        subTitle: '模板消息群发',
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
  let TemplateSendLog = req.app.db.models.TemplateSendLog;
  let templateMessageId = req.params.id;
  let page = parseInt(req.query.page || 1);
  let pageSize = parseInt(req.query.pageSize || 50);
  let start = (page - 1) * pageSize;
  let end = page * pageSize;

  let countQuery = TemplateSendLog.count({ templateMessage: templateMessageId });
  let query = TemplateSendLog.find({ templateMessage: templateMessageId }).populate('templateMessage').populate('subscriber').skip(start).limit(end - start).sort({status: 1});
  
  countQuery.exec(function (err, total) {
    if(err) return next(err);
    query.exec(function (err, docs) {
      if(err) return next(err);
      renderUtil.render({
        path: 'admin/templateGroupSend/log',
        subTitle: '模板消息群发日志',
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