'use strict';

const RenderUtil = require('../../render-util');

exports.index = function(req, res, next) {
  let renderUtil = new RenderUtil(req, res);
  renderUtil.render({
    path: 'admin/dashboard/index',
    subTitle: "控制台"
  });
};