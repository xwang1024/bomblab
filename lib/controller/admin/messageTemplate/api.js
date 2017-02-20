'use strict';

const Wechat = require('../../../service/Wechat');

exports.getList = function(req, res, next) {
  Wechat.getTemplateList().then((data) => {
    res.send(data);
  }).catch(next);
}