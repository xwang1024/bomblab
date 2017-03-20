'use strict';

const _ = require('lodash');
const mongoose = require('mongoose');

exports.get = function(req, res, next) {
  let key = req.params.key;
  let Setting = req.app.db.models.Setting;
  Setting.findOne({ key }).exec(function(err, doc) {
    if(!err) {
      res.send(doc || {});
    } else {
      next(err);
    }
  });
};

exports.put = function(req, res, next) {
  let key = req.params.key;
  let Setting = req.app.db.models.Setting;
  Setting.findOneAndUpdate({ key }, { value: req.body, updatedAt: new Date() }, { upsert: 1 }, function(err, user) {
    if (!err) {
      res.send({success: true});
    } else {
      next(err);
    }
  });
};
