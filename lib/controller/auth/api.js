'use strict';

const Workflow = require("../../service/workflow");

exports.signIn = function(req, res, next){
  let workflow = new Workflow(req, res);

  workflow.on('validate', function() {
    if (!req.body.username) {
      workflow.outcome.error.for.username = '请输入用户名';
      workflow.outcome.error.message.push('请输入用户名');
    }

    if (!req.body.password) {
      workflow.outcome.error.for.password = '请输入密码';
      workflow.outcome.error.message.push('请输入密码');
    }

    if (workflow.hasErrors()) {
      return workflow.emit('response');
    }

    workflow.emit('abuseFilter');
  });

  workflow.on('abuseFilter', function() {
    var getIpCount = function(done) {
      var conditions = { ip: req.ip };
      req.app.db.models.LoginAttempt.count(conditions, function(err, count) {
        if (err) {
          return done(err);
        }

        done(null, count);
      });
    };

    var getIpUserCount = function(done) {
      var conditions = { ip: req.ip, user: req.body.username };
      req.app.db.models.LoginAttempt.count(conditions, function(err, count) {
        if (err) {
          return done(err);
        }

        done(null, count);
      });
    };

    var asyncFinally = function(err, results) {
      if (err) {
        return workflow.emit('exception', err);
      }

      if (results.ip >= req.app.config.loginAttempts.forIp || results.ipUser >= req.app.config.loginAttempts.forIpAndUser) {
        workflow.outcome.error.message.push('登录尝试次数过多，请20分钟之后再试！');
        return workflow.emit('response');
      }
      else {
        workflow.emit('attemptLogin');
      }
    };

    require('async').parallel({ ip: getIpCount, ipUser: getIpUserCount }, asyncFinally);
  });

  workflow.on('attemptLogin', function() {
    req._passport.instance.authenticate('local', function(err, user, info) {
      if (err) {
        return workflow.emit('exception', err);
      }

      if (!user) {
        var fieldsToSet = { ip: req.ip, user: req.body.username };
        req.app.db.models.LoginAttempt.create(fieldsToSet, function(err, doc) {
          if (err) {
            return workflow.emit('exception', err);
          }

          workflow.outcome.error.message.push('用户名/密码错误，或者账号不可用');
          workflow.outcome.error.message.push('如果是新注册的账号，请联系管理员激活帐号。');
          return workflow.emit('response');
        });
      }
      else {
        req.login(user, function(err) {
          if (err) {
            return workflow.emit('exception', err);
          }

          workflow.emit('response');
        });
      }
    })(req, res);
  });

  workflow.emit('validate');
};

exports.signUp = function(req, res, next){
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
    req.app.db.models.User.findOne({ username: req.body.username, isDeleted: { $ne: true } }, function(err, user) {
      if (err) {
        return workflow.emit('exception', err);
      }

      if (user) {
        workflow.outcome.error.for.username = '用户名已存在';
        workflow.outcome.error.message.push('用户名已存在');
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
        isActive: 'no',
        username: req.body.username,
        password: hash
      };
      req.app.db.models.User.create(fieldsToSet, function(err, user) {
        if (err) {
          return workflow.emit('exception', err);
        }

        workflow.user = user;
        workflow.emit('response');
      });
    });
  });
  
  workflow.emit('validate');
};
