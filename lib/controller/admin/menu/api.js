'use strict';

const debug  = require('debug')('BombLab:menu:api');
const Wechat = require('../../../service/Wechat');
const _      = require('lodash');

exports.put = function(req, res, next) {
  debug(req.body.menuConfig);
  res.send({ success: true })
}

exports.delete = function(req, res, next) {
  Wechat.closeMenu().then(() => {
    res.send({ success: true });
  }).catch(next);
}