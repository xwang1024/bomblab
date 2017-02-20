'use strict';

const Wechat = require('../../../service/Wechat');

exports.getList = function(req, res, next) {
  res.send({"template_list":[{"template_id":"w5m2XDO8H1ce7NIpyb-30sPYfyFweUL1PQS4BTd_nH4","title":"测试模板1","primary_industry":"","deputy_industry":"","content":"{{data1.DATA}}\n测试消息：{{data2.DATA}}","example":""}]})
  // Wechat.getTemplateList().then((data) => {
  //   res.send(data);
  // }).catch(next);
}