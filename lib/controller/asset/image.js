'use strict';

const RenderUtil = require('../render-util');

exports.view = function(req, res, next) {
  let { key } = req.params;
  let domain = req.app.config.qiniu.domain;
  res.send(`<head><title>长按识别二维码进群学习</title></head><body style="margin:0"><img style="width:100%" src="http://${domain}/${key}"></body>`);
};