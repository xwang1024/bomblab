'use strict';

const RenderUtil = require('../../renderUtil');
const Wechat = require('../../../service/Wechat');

exports.image = function(req, res, next) {
  let page = req.query.page ? req.query.page : 1;
  let pageSize = 20;

  let renderUtil = new RenderUtil(req, res);
  Wechat.getMaterialList(Wechat.MATERIAL_TYPE.IMAGE, (req.query.page-1)*pageSize, pageSize).then((data) => {
    let transformedData = {
      result: data.item,
      totalCount: data.total_count,
      pageCount: Math.ceil(data.total_count / data.item_count),
      page: page
    }
    renderUtil.render({
      path: 'admin/material/image',
      subTitle: '图片管理',
      data: transformedData
    });
  }).catch(next);

  // let data = {
  //   "item": [
  //     {
  //       "media_id": "WTj0Z5cHzdX6wWC-eqf_Pyd7FAkmYiosa-5ND_3MNo0",
  //       "name": "test.png",
  //       "update_time": 1486801190,
  //       "url": "http://mmbiz.qpic.cn/mmbiz_png/r9mPZUXxdp0zF4p2gLvc5p1fGia9icHL8Qh4pJlG5j2u8fHco0SssJ74tvkRDLksYTjsMbp7IHFNQ9icnicLWbeKyw/0?wx_fmt=png"
  //     }
  //   ],
  //   "total_count": 1,
  //   "item_count": 1
  // }
  // let transformedData = {
  //   result: data.item,
  //   totalCount: data.total_count,
  //   pageCount: Math.ceil(data.total_count / data.item_count),
  //   page: page
  // }
  // renderUtil.render({
  //     path: 'admin/material/image',
  //     subTitle: '图片管理',
  //     data: transformedData
  //   });
};

exports.preview = function(req, res, next) {
  let mediaId = req.query.mediaId;
  if(!mediaId) return res.status(400).end();
  return Wechat.getMaterial(mediaId).then((request) => {
    request.pipe(res);
  }).catch((err) => {
    console.log(err);
    res.status(500).end();
  });
};