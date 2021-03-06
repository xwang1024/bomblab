'use strict';

const _ = require('lodash');
const Wechat = require('../../../service/Wechat');
const async = require('async');

exports.sync = function(req, res, next) {
  let Subscriber = req.app.db.models.Subscriber;
  Subscriber.update({}, { subscribe: false }, { multi: true }).exec((err) => {
    if (err) return callback(err);
    Wechat.getCompleteOpenIdList().then((remoteList) => {
      async.eachOfSeries(remoteList, function(openId, index, callback) {
        Wechat.getSubscriberInfo(openId).then((info) => {
          let newData = {
            openId: info.openid,
            groupId: info.groupid,
            unionId: info.unionid,
            subscribe: info.subscribe ? true : false,
            subscribeTime: new Date(info.subscribe_time * 1000),
            nickname: info.nickname,
            remark: info.remark,
            gender: info.sex,
            headImgUrl: info.headimgurl,
            city: info.city,
            province: info.province,
            country: info.country,
            language: info.language
          };
          Subscriber.findOneAndUpdate({ openId }, newData, { upsert: true }, function(err, doc){
            if (err) return callback(err);
            console.log('Sync: ' + info.openid + ` (${index}/${remoteList.length})`);
            return callback();
          });
        }).catch((err) => {
          console.error('Sync error:', err);
          callback();
        });
      }, function(err) {
        if(err) return next(err);
        res.send({ remoteList });
      });
    });
  });
};

