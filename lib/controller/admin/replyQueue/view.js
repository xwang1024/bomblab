'use strict';

const RenderUtil = require('../../renderUtil');
const Wechat = require('../../../service/Wechat');

exports.index = function(req, res, next) {
  let renderUtil = new RenderUtil(req, res);
  renderUtil.render({
    path: 'admin/replyQueue',
    subTitle: '回复队列管理',
    data: {}
  });
};