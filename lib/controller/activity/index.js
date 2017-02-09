'use strict';

exports.get = function(req, res, next) {
  var Activity = req.app.db.models.Activity;
  
  Activity.find({}).populate('asset').exec(function(err, docs) {
    if(!err) {
      res.render('activity/list', {_DATA_: {result: docs}});
    } else {
      next(err);
    }
  });
};

exports.post = function(req, res, next) {
  var Activity = req.app.db.models.Activity;
  let activity = new Activity(req.body);
  activity.save(function(err) {
    if(!err) {
      res.send({success: true});
    } else {
      next(err);
    }
  });
};

exports.put = function(req, res, next) {
  var id = req.params.id;
  var Activity = req.app.db.models.Activity;
  
  Activity.findByIdAndUpdate(id, req.body, {new: true}, function(err, user) {
    if (!err) {
      res.send({success: true});
    } else {
      next(err);
    }
  });
};

exports.delete = function(req, res, next) {
  var id = req.params.id;
  var Activity = req.app.db.models.Activity;

  Activity.remove({ _id: id }, function(err) {
    if (!err) {
      res.send({success: true});
    } else {
      next(err);
    }
  });
};

