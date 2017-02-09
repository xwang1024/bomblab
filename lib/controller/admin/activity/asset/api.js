'use strict';

const _ = require('lodash');
const Xiumi = require('../../../../service/Xiumi');

exports.image = function(req, res, next) {
  let key = req.params.key;
  let domain = req.app.config.qiniu.domain;
  res.send(`<body style="margin:0"><img style="width:100%" src="http://${domain}/${key}"></body>`)
};

exports.get = function(req, res, next) {
  let id = req.params.id;
  let Asset = req.app.db.models.Asset;
  Asset.findById(id).exec(function(err, doc) {
    res.send(doc);
  })
};

exports.post = function(req, res, next) {
  let Asset = req.app.db.models.Asset;
  let assetData = _.assign({}, req.body);
  let imageUrl = 'http://' + req.app.config.qiniu.domain + '/' + assetData.key;

  Xiumi.uploadImage(imageUrl).then((mediaId) => {
    assetData.mediaId = mediaId;
    let asset = new Asset(assetData);
    asset.save(function(err, doc) {
      if(!err) {
        res.send(doc);
      } else {
        next(err);
      }
    });
  }).catch(next);
};

exports.put = function(req, res, next) {
  let id = req.params.id;
  let Asset = req.app.db.models.Asset;
  
  Asset.findByIdAndUpdate(id, req.body, {new: true}, function(err, user) {
    if (!err) {
      res.send({success: true});
    } else {
      next(err);
    }
  });
};

exports.delete = function(req, res, next) {
  let id = req.params.id;
  let Asset = req.app.db.models.Asset;

  Asset.remove({ _id: id }, function(err) {
    if (!err) {
      res.send({success: true});
    } else {
      next(err);
    }
  });
};
