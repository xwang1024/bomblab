'use strict';

const Workflow = require("../../../service/workflow");

exports.post = function(req, res, next){
  let workflow = new Workflow(req, res);

  workflow.on('validate', function() {
    if (!req.body.username) {
      workflow.outcome.error.for.username = 'required';
    } else if (!/^[a-zA-Z0-9\-\_]+$/.test(req.body.username)) {
      workflow.outcome.error.for.username = '只能使用字母, 数字, \'-\', \'_\'';
      workflow.outcome.error.message.push('用户名只能使用字母, 数字, \'-\', \'_\'');
    }

    if (!req.body.password) {
      workflow.outcome.error.for.password = '请输入密码';
      workflow.outcome.error.message.push('请输入密码');
    }

    if (!req.body.role) {
      workflow.outcome.error.for.role = '请选择角色';
      workflow.outcome.error.message.push('请选择角色');
    }

    if (!req.body.isActive) {
      workflow.outcome.error.for.isActive = '请选择是否可用';
      workflow.outcome.error.message.push('请选择是否可用');
    }

    if (req.body.password) {
      var regex = /^(?=.*[A-Z])(?=.*[0-9])(?=.*[a-z]).{6,}$/;
      if(!regex.test(req.body.password)) {
        workflow.outcome.error.for.password = '至少6位，且包含大小写字母和数字';
        workflow.outcome.error.message.push('密码至少6位，且包含大小写字母和数字');
      }
    }

    if (workflow.hasErrors()) {
      return workflow.emit('response');
    }

    workflow.emit('duplicateUsernameCheck');
  });

  workflow.on('duplicateUsernameCheck', function() {
    req.app.db.models.User.findOne({ username: req.body.username, isDeleted: {$ne: true}}, function(err, user) {
      if (err) {
        return workflow.emit('exception', err);
      }

      if (user) {
        workflow.outcome.error.for.username = '用户名已存在';
        workflow.outcome.error.message.push('请选择角色');
        return workflow.emit('response');
      }

      workflow.emit('createUser');
    });
  });

  workflow.on('createUser', function() {
    req.app.db.models.User.encryptPassword(req.body.password, function(err, hash) {
      if (err) {
        return workflow.emit('exception', err);
      }

      var fieldsToSet = {
        isActive: req.body.isActive,
        role    : req.body.role,
        username: req.body.username,
        password: hash
      };
      req.app.db.models.User.create(fieldsToSet, function(err, user) {
        if (err) {
          return workflow.emit('exception', err);
        }
        workflow.outcome.user = user;
        workflow.emit('response');
      });
    });
  });

  workflow.emit('validate');
};

exports.put = function(req, res, next){
  let workflow = new Workflow(req, res);

  workflow.on('validate', function() {
    if (!req.body.isActive) {
      req.body.isActive = 'no';
    }

    if (!req.body.role) {
      req.body.role = 'normal';
    }

    if (req.body.password) {
      return workflow.emit('encryptPassword');
    }

    workflow.emit('patchUser');
  });

  workflow.on('encryptPassword', function() {
    req.app.db.models.User.encryptPassword(req.body.password, function(err, hash) {
      if (err) {
        return workflow.emit('exception', err);
      }
      req.body.password = hash;
      workflow.emit('patchUser');
    });
  });

  workflow.on('patchUser', function() {
    var fieldsToSet = {
      isActive: req.body.isActive,
      role: req.body.role
    };
    if(req.body.username) {
      fieldsToSet.username = req.body.username;
    }
    if(req.body.password) {
      fieldsToSet.password = req.body.password;
    }
    var options = { new: true };
    req.app.db.models.User.findByIdAndUpdate(req.params.id, fieldsToSet, options, function(err, user) {
      if (err) {
        return workflow.emit('exception', err);
      }

      workflow.outcome.user = user;
      workflow.emit('response');
    });
  });

  workflow.emit('validate');
};

exports.delete = function(req, res, next) {
  let workflow = new Workflow(req, res);

  workflow.on('validate', function() {
    if (req.user._id == req.params.id) {
      workflow.outcome.error.message.push('您不可以删除自己的账号');
      return workflow.emit('response');
    }

    workflow.emit('deleteUser');
  });

  workflow.on('deleteUser', function(err) {
    req.app.db.models.User.findByIdAndUpdate(req.params.id, {isDeleted: true}, {new :1}, function(err, user) {
      if (err) {
        return workflow.emit('exception', err);
      }
      workflow.outcome.user = user;
      workflow.emit('response');
    });
  });

  workflow.emit('validate');
};