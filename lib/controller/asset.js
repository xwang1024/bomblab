'use strict';

const _ = require('lodash');

exports.get = function(req, res, next) {
  var id = req.params.id;
  var Asset = req.app.db.models.Asset;
  Asset.findById(id).exec(function(err, doc) {
    res.send(doc);
  })
};

exports.post = function(req, res, next) {
  var Asset = req.app.db.models.Asset;
  var assetData = _.assign({}, req.body);
  var imageUrl = 'http://' + req.app.config.qiniu.domain + '/' + assetData.key;

  console.log(imageUrl)
  req.app.xiumi.login(()=>{
    console.log(1)
    req.app.xiumi.uploadImage(imageUrl, (mediaId) => {
      console.log(mediaId)
      assetData.mediaId = mediaId;
      let asset = new Asset(assetData);
      asset.save(function(err, doc) {
        if(!err) {
          res.send(doc);
        } else {
          next(err);
        }
      });
    }, next);
  }, next);
};

exports.put = function(req, res, next) {
  var id = req.params.id;
  var Asset = req.app.db.models.Asset;
  
  Asset.findByIdAndUpdate(id, req.body, {new: true}, function(err, user) {
    if (!err) {
      res.send({success: true});
    } else {
      next(err);
    }
  });
};

exports.delete = function(req, res, next) {
  var id = req.params.id;
  var Asset = req.app.db.models.Asset;

  Asset.remove({ _id: id }, function(err) {
    if (!err) {
      res.send({success: true});
    } else {
      next(err);
    }
  });
};
