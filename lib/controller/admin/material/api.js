'use strict';

const debug  = require('debug')('Pabao:test:api');
const Wechat = require('../../../service/Wechat');
const path   = require('path');
const fs     = require('fs');
const _      = require('lodash');
const async  = require('async');

exports.getImage = function(req, res, next) {
  let page = req.query.page ? req.query.page : 1;
  let pageSize = 10;

  // Wechat.getMaterialList(Wechat.MATERIAL_TYPE.IMAGE, (req.query.page-1)*pageSize, pageSize).then((data) => {
  //   let transformedData = {
  //     result: data.item,
  //     totalCount: data.total_count,
  //     pageCount: Math.ceil(data.total_count / data.item_count),
  //     page: page
  //   }
  //   res.send(transformedData);
  // }).catch(next);
  res.send({"result":[{"media_id":"WTj0Z5cHzdX6wWC-eqf_P-A2wgNZPopUOkvDN58KuCA","name":"WechatIMG25.jpeg","update_time":1487397687,"url":"http://mmbiz.qpic.cn/mmbiz_jpg/r9mPZUXxdp0lyscTYFiaRMibFZ1o4fCM7rtVK3CGt3OZUc60jrdvVMsUulex5tZTiaGDJqr7AorvVn7PyqJAnj72w/0?wx_fmt=jpeg"},{"media_id":"WTj0Z5cHzdX6wWC-eqf_Pwcu0nEIgogQuL2ryKtFlt0","name":"WechatIMG25.jpeg","update_time":1487394584,"url":"http://mmbiz.qpic.cn/mmbiz_jpg/r9mPZUXxdp0lyscTYFiaRMibFZ1o4fCM7rtVK3CGt3OZUc60jrdvVMsUulex5tZTiaGDJqr7AorvVn7PyqJAnj72w/0?wx_fmt=jpeg"},{"media_id":"WTj0Z5cHzdX6wWC-eqf_Pw1aZZbGWf5FwZGVtzJAFKc","name":"course_plus.png","update_time":1487394510,"url":"http://mmbiz.qpic.cn/mmbiz_png/r9mPZUXxdp0lyscTYFiaRMibFZ1o4fCM7rB8Nl7JdAeZiaFokz6jmqvzFiaNxYjerQlGqha9bBDR0KHNyzfyce3Cxw/0?wx_fmt=png"},{"media_id":"WTj0Z5cHzdX6wWC-eqf_P1ypErNXx7ZGJ8s1bvRUK3Q","name":"vim.jpg","update_time":1487259600,"url":"http://mmbiz.qpic.cn/mmbiz_jpg/r9mPZUXxdp0ylbnd350zuYKEyM7UhvYw8bkicQffKgMwk9nAslR3Dmd8hxFmpwCjzMCEycnu8X6OBvQQiaic8nslg/0?wx_fmt=jpeg"},{"media_id":"WTj0Z5cHzdX6wWC-eqf_Pyd7FAkmYiosa-5ND_3MNo0","name":"test.png","update_time":1486801190,"url":"http://mmbiz.qpic.cn/mmbiz_png/r9mPZUXxdp0zF4p2gLvc5p1fGia9icHL8Qh4pJlG5j2u8fHco0SssJ74tvkRDLksYTjsMbp7IHFNQ9icnicLWbeKyw/0?wx_fmt=png"}],"totalCount":5,"pageCount":1,"page":"1"});
}

exports.post = function(req, res, next) {
  async.parallel([getMaterialType, saveFile], function (err, results) {
    let [ type, filePath ] = results;
    Wechat.uploadMaterial(type, filePath).then((data) => {
      fs.unlink(filePath);  
      res.send(data);
    }).catch((err) => {
      fs.unlink(filePath);  
      next(err);
    });
  });

  function getMaterialType(callback) {
    let type = null;
    req.busboy.on('field', function (key, value, keyTruncated, valueTruncated) {
      if(key === 'type') {
        type = value;
      }
    });
    req.busboy.on('finish', function () {
      callback(null, type);
    });
  }

  function saveFile(callback) {
    req.busboy.on('file', function (fieldName, file, fileName, encoding, mimeType) {
      let filePath = path.resolve(__dirname, '../../../' + fileName);
      let writeStream = fs.createWriteStream(filePath);
      writeStream.on("close", function (err) {
        if (err) return callback(err, null);
        else return callback(null, filePath);
      });
      file.pipe(writeStream);
    });
  }

  req.pipe(req.busboy);
}

exports.delete = function(req, res, next) {
  let { mediaId } = req.params;
  Wechat.deleteMaterial(mediaId).then(() => {
    res.send({ success: true });
  }).catch(next);
}