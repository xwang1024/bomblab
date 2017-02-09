'use strict';

const RenderUtil = require('../../render-util');

exports.index = function(req, res, next) {
  let renderUtil = new RenderUtil(req, res);
  req.app.db.models.User.find({ isDeleted: { $ne: true } }).exec(function(err, users) {
    if(err) next(err);
    renderUtil.render({
      path: 'root/user/index',
      subTitle: '运营账号管理',
      data: { users }
    });
  });
};