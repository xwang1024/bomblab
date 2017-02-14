'use strict';

const RenderUtil = require('../../renderUtil');
const Wechat = require('../../../service/Wechat');

exports.index = function(req, res, next) {
  let renderUtil = new RenderUtil(req, res);
  // Wechat.getMenu().then((data) => {
  //   renderUtil.render({
  //     path: 'admin/menu',
  //     subTitle: '自定义菜单管理',
  //     data: {
  //       menuConfig: data
  //     }
  //   });
  // }).catch((err) => {
  //   if(err.message && err.message.indexOf('46003') >= 0) {
  //     renderUtil.render({
  //       path: 'admin/menu',
  //       subTitle: '自定义菜单管理',
  //       data: {}
  //     });
  //   } else {
  //     next(err);
  //   }
  // });
  renderUtil.render({
    path: 'admin/menu',
    subTitle: '自定义菜单管理',
    data: {}
  });
};