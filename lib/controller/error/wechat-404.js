'use strict';

const RenderUtil = require('../render-util');

exports.view = function(req, res, next) {
  let renderUtil = new RenderUtil(req, res);
  renderUtil.render({
    path: 'error/wechat-404',
    title: '找不到页面',
    layout: 'mobile'
  });
};