'use strict';

const RenderUtil = require('../../renderUtil');
const Wechat = require('../../../service/Wechat');

exports.index = function(req, res, next) {
  let renderUtil = new RenderUtil(req, res);
  renderUtil.render({
    path: 'admin/subcribeReply',
    subTitle: '关注回复管理',
    data: {}
  });
};