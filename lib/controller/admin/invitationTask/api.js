'use strict';

const _ = require('lodash');
const Mongo  = require('../../../service/Mongo');
const DB     = Mongo.getClient();
const InvitationTask = DB.models.InvitationTask;

exports.post = function(req, res, next) {
  let task = new InvitationTask(req.body);
  task.save(function(err) {
    if(!err) {
      res.send({success: true});
    } else {
      next(err);
    }
  });
};

exports.put = function(req, res, next) {
  let id = req.params.id;
  InvitationTask.findByIdAndUpdate(id, req.body, {new: true}, function(err, user) {
    if (!err) {
      res.send({success: true});
    } else {
      next(err);
    }
  });
};

// exports.delete = function(req, res, next) {
//   let id = req.params.id;
//   InvitationTask.remove({ _id: id }, function(err) {
//     if (!err) {
//       res.send({success: true});
//     } else {
//       next(err);
//     }
//   });
// };