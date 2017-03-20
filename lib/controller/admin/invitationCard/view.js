'use strict';

const RenderUtil = require('../../renderUtil');
const Wechat = require('../../../service/Wechat');

exports.index = function(req, res, next) {
  let renderUtil = new RenderUtil(req, res);
  let InvitationCard = req.app.db.models.InvitationCard;
  let Subscriber = req.app.db.models.Subscriber;
  let page = parseInt(req.query.page || 1);
  let pageSize = parseInt(req.query.pageSize || 10);
  let start = (page - 1) * pageSize;
  let end = page * pageSize;

  let countQuery = InvitationCard.count();
  let query = InvitationCard.find().skip(start).limit(end - start).populate('subscriber').sort({ invitedCount: -1 });
  
  
  countQuery.exec(function (err, total) {
    if(err) return next(err);
    query.exec(function (err, docs) {
      if(err) return next(err);
      
      renderUtil.render({
        path: 'admin/invitationCard',
        subTitle: '邀请卡列表',
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

exports.settings = function(req, res, next) {
  let renderUtil = new RenderUtil(req, res);
  let Setting = req.app.db.models.Setting;

  Setting.findOne({ key: 'invitationCardImage' }).exec(function (err, setting) {
    if(err) return next(err);
    renderUtil.render({
      path: 'admin/invitationCard/settings',
      subTitle: '邀请卡配置',
      data: {
        setting
      }
    });
  });
};