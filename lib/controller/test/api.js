'use strict';

const debug  = require('debug')('Pabao:test:api');
const Wechat = require('../../service/Wechat');
const config = require('../../config');
const path   = require('path');
const _      = require('lodash');
const async  = require('async');

exports.test = function(req, res) {
  res.send(1);
}

exports.test1 = function (req, res, next) {
  Wechat.uploadMedia('image', path.resolve(__dirname, '../../../test.png')).then((data) => {
    res.send(data);
  })
  // res.send(path.resolve(__dirname, '../../../test.png'));
};

exports.uploadFile = function (req, res, next) {
  let type = null;

  async.parallel([getParams, saveData], function (err, results) {
    res.send({err, results})
  });

  function getParams(callback) {
    req.busboy.on('field', function (key, value, keyTruncated, valueTruncated) {
      switch (key) {
        case 'type':
          type = value;
          break;
        default:
          break;
      }
    });
    req.busboy.on('finish', function () {
      callback(null, null);
    });
  }

  function saveData(callback) {
    req.busboy.on('file', function (fieldName, file, fileName, encoding, mimeType) {
        
      let writeStream = fs.createWriteStream('./' + fileName);
      writeStream.on("close", function (err) {
        if (err) {
          callback(err, null);
        } else {
          callback(null, type);
        }
      });
      file.pipe(writeStream);
    });
  }

  req.pipe(req.busboy);
};