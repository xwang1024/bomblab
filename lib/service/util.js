'use strict';

var debug = require('debug')('Pabao:services:utils');
var _ = require('lodash');

exports.sendError = function sendError(res, status, message) {
  res.status(status).send({error: {message: message}});
};

exports.toMap = function (array, propertyName) {
  let result = {};
  if (array instanceof Array && array.length > 0) {
    array.map(single=> {
      result[single[propertyName]] = single;
    });
  }
  return result;
};

exports.findOneById = function findOneById(Model, id, dataHandler, errorHandler, name) {
  Model.findOne({_id: id, isDeleted: {$ne: true}}).exec(function (err, data) {
    if (err) {
      if (err.name === 'CastError' && err.kind === 'ObjectId') {
        errorHandler(200, '找不到该' + name + ', id: ' + id);
      } else {
        errorHandler(500, '服务器错误');
        console.log(err);
      }
    } else {
      if (!data) {
        errorHandler(200, '找不到该' + name + ', id: ' + id);
      } else {
        dataHandler(data);
      }
    }
  });
};

function uniqueArray(array) {
  array.sort();
  if (array.length > 0) {
    var re = [array[0]];
    for (var i = 1; i < array.length; i++) {
      if (array[i] !== re[re.length - 1]) {
        re.push(array[i]);
      }
    }
    return re;
  } else {
    return [];
  }
}
exports.uniqueArray = uniqueArray;

exports.getResourceName = function getResourceName(req) {
  let pathStr = req.path;
  let slashIndex = pathStr.lastIndexOf('/');
  if (slashIndex !== pathStr.length - 1)
    return pathStr.substring(slashIndex + 1, pathStr.length);
  else
    return '';
};

function isStringNotEmpty(s) {
  if (s && (typeof s === 'string') && _.trim(s).length > 0) return true;
  else return false;
}
exports.isStringNotEmpty = isStringNotEmpty;

exports.isStringArrayNotEmpty = function isStringArrayNotEmpty(arr) {
  if (arr && arr instanceof Array) {
    if (arr.length > 0) {
      let arru = uniqueArray(arr).filter(function (i) {
        return isStringNotEmpty(i)
      });
      if (arru.length > 0) {
        return true;
      }
    }
  }
  return false;
};

function getTagList(Media, handler) {
  Media.find().where('isDeleted').equals(false).select('tags').exec(function (err, data) {
    if (err) {
      handler(err, null);
    } else {
      let tagSet = [];
      data.map(tagItem => tagSet = tagSet.concat(tagItem.tags));
      handler(null, uniqueArray(tagSet));
    }
  });
}
exports.getTagList = getTagList;

function sortHintTag(data, key) {
  let dataList = [];
  //TODO 优化排序
  data.map(i => {
    let dataItem = {};
    dataItem.index = i.indexOf(key);
    dataItem.key = key;
    dataItem.hint = i;
    if (dataItem.index >= 0)
      dataList.push(dataItem);
  });
  dataList.sort();
  dataList.sort(sortHint);
  let wordList = [];
  dataList.map(i => wordList.push(i.hint));
  return wordList;
}
exports.sortHintTag = sortHintTag;

function sortHint(h1, h2) {
  return h1.index - h2.index;
}

