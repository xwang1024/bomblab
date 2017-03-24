'use strict';

const _ = require('lodash');
const Wechat = require('../../service/Wechat');

exports.clearQuota = function(req, res, next) {
  Wechat.clearQuota().then((data) => {
    res.send(data);
  }).catch(next)
};