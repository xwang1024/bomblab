'use strict';

const debug  = require('debug')('Pabao:test:api');
const Wechat = require('../../../service/Wechat');
const path   = require('path');
const fs     = require('fs');
const _      = require('lodash');
const async  = require('async');

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