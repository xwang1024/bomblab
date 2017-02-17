'use strict';

const debug  = require('debug')('BombLab:menu:api');
const Wechat = require('../../../service/Wechat');
const _      = require('lodash');

exports.get = function(req, res, next) {
  Wechat.getMenu().then((data) => {
    res.send(data);
  }).catch((err) => {
    if(err.message && err.message.indexOf('46003') >= 0) {
      res.send({});
    } else {
      next(err);
    }
  });
};

exports.put = function(req, res, next) {
  let menuConfig = req.body.menuConfig;
  Wechat.updateMenu(menuConfig.menu).then(() => {
    res.send({ success: true });
  }).catch(next);
}

exports.delete = function(req, res, next) {
  Wechat.closeMenu().then(() => {
    res.send({ success: true });
  }).catch(next);
}