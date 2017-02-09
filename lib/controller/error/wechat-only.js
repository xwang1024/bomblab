'use strict';

const RenderUtil = require('../render-util');

exports.view = function(req, res, next) {
  let renderUtil = new RenderUtil(req, res);
  renderUtil.render({
    path: 'error/wechat-only',
    title: '请使用微信扫码打开页面',
    layout: 'mobile'
  });
};