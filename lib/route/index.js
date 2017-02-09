'use strict';

var express = require('express');
var router = express.Router();

module.exports = exports = function () {
  router.get('/wechat/api/access', require('../controller/wechat/index').wechatValidation);
  // router.post('/wechat/api/access', require('./controller/wechat/index').processWechatEvent);

  // router.get('/signIn', require('./controller/admin/view/auth').signIn);
  // router.get('/signUp', require('./controller/admin/view/auth').signUp);
  
  // router.post('/signIn', require('./controller/admin/auth').signIn);
  // router.post('/signUp', require('./controller/admin/auth').signUp);
  // router.all('/signOut', require('./controller/admin/auth').signOut);

  // router.get('/test', function(req, res) {
  //   res.send('<head><title>活动</title></head><body style="margin:0"><img src="http://ohq2w7iao.bkt.clouddn.com/49279597_p0.jpg"></body>');
  // });

  // router.get('/', require('./controller/index').index);

  // router.get('/activity', require('./controller/activity').get);
  // router.post('/api/activity', require('./controller/activity').post);
  // router.put('/api/activity/:id', require('./controller/activity').put);
  // router.delete('/api/activity/:id', require('./controller/activity').delete);
  
  // router.get('/activity/:id/asset', require('./controller/activity/asset').get);
  // router.post('/api/asset', require('./controller/asset').post);
  // router.put('/api/asset/:id', require('./controller/asset').put);
  // router.delete('/api/asset/:id', require('./controller/asset').delete);

  // // 七牛相关API
  // router.get(`/api/qiniu/uptoken`     , require(`./controller/qiniu/uptoken`).get);
  // router.get(`/api/qiniu/downloadUrl` , require(`./controller/qiniu/download_url`).get);

  return router;
};

// 登录检查
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.set('X-Auth-Required', 'true');
  req.session.returnUrl = req.originalUrl;
  res.redirect('/signIn');
}

// 管理权限检查
function ensureAdmin(req, res, next) {
  if (req.user.canPlayRoleOf('admin')) {
    return next();
  }
  res.status(403).send('您没有权限执行该操作').end();
}