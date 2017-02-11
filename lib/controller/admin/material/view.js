'use strict';

const RenderUtil = require('../../render-util');
const Wechat = require('../../../service/Wechat');

exports.image = function(req, res, next) {
  let renderUtil = new RenderUtil(req, res);
  Wechat.getMaterialList(Wechat.MATERIAL_TYPE.IMAGE, 0, 20).then((data) => {
    renderUtil.render({
      path: 'admin/material/image',
      subTitle: '图片管理',
      data: data
    });
  }).catch(next);
};