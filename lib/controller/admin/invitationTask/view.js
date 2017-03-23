'use strict';

const RenderUtil = require('../../renderUtil');
const Mongo  = require('../../../service/Mongo');
const DB     = Mongo.getClient();
const InvitationTask = DB.models.InvitationTask;
const InvitationCard = DB.models.InvitationCard;
const Subscriber = DB.models.Subscriber;

exports.index = function(req, res, next) {
  let renderUtil = new RenderUtil(req, res);
  let InvitationTask = req.app.db.models.InvitationTask;
  let page = parseInt(req.query.page || 1);
  let pageSize = parseInt(req.query.pageSize || 10);
  let start = (page - 1) * pageSize;
  let end = page * pageSize;

  let countQuery = InvitationTask.count();
  let query = InvitationTask.find().skip(start).limit(end - start).sort({ createdAt: -1 });
  
  countQuery.exec(function (err, total) {
    if(err) return next(err);
    query.exec(function (err, docs) {
      if(err) return next(err);
      
      renderUtil.render({
        path: 'admin/invitationTask',
        subTitle: '邀请任务列表',
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

exports.create = function(req, res, next) {
  let renderUtil = new RenderUtil(req, res);
  renderUtil.render({
    path: 'admin/invitationTask/create',
    subTitle: '增加邀请任务',
    data: {}
  });
};

exports.modify = function(req, res, next) {
  let renderUtil = new RenderUtil(req, res);
  const id = req.params.id;
  
  InvitationTask.findById(id).exec((err, doc) => {
    if(err) return next(err);
    renderUtil.render({
      path: 'admin/invitationTask/modify',
      subTitle: '修改邀请任务',
      data: doc
    }
    );
  });
}

exports.cardList = function(req, res, next) {
  const invitationTaskId = req.params.id;

  let renderUtil = new RenderUtil(req, res);
  let conditions = { invitationTask: invitationTaskId };
  let page = parseInt(req.query.page || 1);
  let pageSize = parseInt(req.query.pageSize || 10);
  let start = (page - 1) * pageSize;
  let end = page * pageSize;

  let countQuery = InvitationCard.count(conditions);
  let query = InvitationCard.find(conditions).skip(start).limit(end - start).populate('subscriber').sort({ invitedCount: -1 });
  
  
  countQuery.exec(function (err, total) {
    if(err) return next(err);
    query.exec(function (err, docs) {
      if(err) return next(err);
      
      renderUtil.render({
        path: 'admin/invitationTask/cardList',
        subTitle: '邀请任务详情',
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
}