'use strict';

const URL     = require('url');
const express = require('express');
const router  = express.Router();
const Wechat  = require('../service/Wechat');

module.exports = exports = function () {

  // DEBUG
  router.all('/', (req, res, next) => {
    res.status(403).send('<h1 style="text-align: center; border-bottom: 1px solid gray">403 Forbidden</h1>').end();
  });


  router.get('/api/admin/test', require('../controller/admin/test').index);

  // 微信
  router.get('/api/wechat/access', require('../controller/wechat/index').wechatValidation);
  router.post('/api/wechat/access', require('../controller/wechat/index').processWechatEvent);
  router.all('/api/wechat/updateAccessToken', require('../controller/wechat/index').updateAccessToken);

  // 普通权限
  router.all('/auth/signIn', require('../controller/auth/view').signIn);
  router.all('/auth/signUp', require('../controller/auth/view').signUp);
  router.all('/auth/signOut', require('../controller/auth/view').signOut);

  router.post('/api/auth/signIn', require('../controller/auth/api').signIn);
  router.post('/api/auth/signUp', require('../controller/auth/api').signUp);

  router.get('/api/qiniu/uptoken'     , require('../controller/qiniu/uptoken').get);
  router.get('/api/qiniu/downloadUrl' , require('../controller/qiniu/downloadUrl').get);

  router.get('/asset/:key', require('../controller/asset/image').view);

  // 运营权限
  router.all('/admin*', ensureAuthenticated);
  router.all('/admin', require('../controller/admin/view').index);
  // 控制台
  router.all('/admin/dashboard', require('../controller/admin/dashboard/view').index);
  // 扫码返图
  router.all('/admin/activity', require('../controller/admin/activity/view').index);
  router.all('/admin/activity/:id/asset', require('../controller/admin/activity/asset/view').index);
  // 图片素材管理
  router.all('/admin/material/image', require('../controller/admin/material/view').image);
  router.all('/admin/material/image/preview', require('../controller/admin/material/view').preview);
  // 自定义菜单管理
  router.all('/admin/menu', require('../controller/admin/menu/view').index);
  // 回复队列管理
  router.all('/admin/replyQueue', require('../controller/admin/replyQueue/view').index);
  // 关注回复管理
  router.all('/admin/subscribeReply', require('../controller/admin/subscribeReply/view').index);
  // 订阅者管理
  router.all('/admin/subscriber', require('../controller/admin/subscriber/view').index);
  // 客服消息群发
  router.all('/admin/customGroupSend', require('../controller/admin/customGroupSend/view').index);
  router.all('/admin/customGroupSend/:id/log', require('../controller/admin/customGroupSend/view').log);
  // 模板消息群发
  router.all('/admin/templateGroupSend', require('../controller/admin/templateGroupSend/view').index);
  router.all('/admin/templateGroupSend/:id/log', require('../controller/admin/templateGroupSend/view').log);
  // 邀请卡管理
  router.all('/admin/invatationCard', require('../controller/admin/invatationCard/view').index);
  
  router.all('/api/admin*', ensureAuthenticated);
  // 控制台
  router.all('/api/admin/dashboard/subscribe', require('../controller/admin/dashboard/api').subscribe);
  // 扫码返图
  router.post('/api/admin/activity', require('../controller/admin/activity/api').post);
  router.put('/api/admin/activity/:id', require('../controller/admin/activity/api').put);
  router.delete('/api/admin/activity/:id', require('../controller/admin/activity/api').delete);
  router.get('/api/admin/activity/:id/stat', require('../controller/admin/activity/api').getStat);
  
  router.post('/api/admin/asset', require('../controller/admin/activity/asset/api').post);
  router.put('/api/admin/asset/:id', require('../controller/admin/activity/asset/api').put);
  router.delete('/api/admin/asset/:id', require('../controller/admin/activity/asset/api').delete);
  // 图片素材管理
  router.get('/api/admin/material/image', require('../controller/admin/material/api').getImage);
  router.post('/api/admin/material', require('../controller/admin/material/api').post);
  router.delete('/api/admin/material/:mediaId', require('../controller/admin/material/api').delete);
  // 自定义菜单管理
  router.get('/api/admin/menu', require('../controller/admin/menu/api').get);
  router.put('/api/admin/menu', require('../controller/admin/menu/api').put);
  router.delete('/api/admin/menu', require('../controller/admin/menu/api').delete);
  // 回复队列管理
  router.get('/api/admin/replyQueue', require('../controller/admin/replyQueue/api').get);
  router.post('/api/admin/replyQueue', require('../controller/admin/replyQueue/api').post);
  router.get('/api/admin/replyQueue/:id', require('../controller/admin/replyQueue/api').getById);
  router.put('/api/admin/replyQueue/:id', require('../controller/admin/replyQueue/api').put);
  router.delete('/api/admin/replyQueue/:id', require('../controller/admin/replyQueue/api').delete);
  // 订阅者管理
  router.post('/api/admin/subscriber/sync', require('../controller/admin/subscriber/api').sync);
  // 关注定时回复
  router.post('/api/admin/subscribeReply', require('../controller/admin/subscribeReply/api').post);
  router.get('/api/admin/subscribeReply/:id', require('../controller/admin/subscribeReply/api').get);
  router.put('/api/admin/subscribeReply/:id', require('../controller/admin/subscribeReply/api').put);
  router.delete('/api/admin/subscribeReply/:id', require('../controller/admin/subscribeReply/api').delete);
  // 客服消息群发
  router.post('/api/admin/customGroupSend', require('../controller/admin/customGroupSend/api').post);
  router.get('/api/admin/customGroupSend/:id', require('../controller/admin/customGroupSend/api').get);
  router.post('/api/admin/customGroupSend/:id/send', require('../controller/admin/customGroupSend/api').send);
  router.put('/api/admin/customGroupSend/:id', require('../controller/admin/customGroupSend/api').put);
  router.delete('/api/admin/customGroupSend/:id', require('../controller/admin/customGroupSend/api').delete);
  // 模板消息群发
  router.post('/api/admin/templateGroupSend', require('../controller/admin/templateGroupSend/api').post);
  router.get('/api/admin/templateGroupSend/:id', require('../controller/admin/templateGroupSend/api').get);
  router.post('/api/admin/templateGroupSend/:id/send', require('../controller/admin/templateGroupSend/api').send);
  router.put('/api/admin/templateGroupSend/:id', require('../controller/admin/templateGroupSend/api').put);
  router.delete('/api/admin/templateGroupSend/:id', require('../controller/admin/templateGroupSend/api').delete);
  // 模板消息
  router.get('/api/admin/messageTemplate', require('../controller/admin/messageTemplate/api').getList);

  // 管理员权限
  router.all('/root*', ensureAuthenticated);
  router.all('/root*', ensureAdmin);
  router.all('/root/user', require('../controller/root/user/view').index);
  
  router.all('/api/root*', ensureAdmin);
  router.post('/api/root/user', require('../controller/root/user/api').post);
  router.put('/api/root/user/:id', require('../controller/root/user/api').put);
  router.delete('/api/root/user/:id', require('../controller/root/user/api').delete);

  // 微信活动链接
  router.all('/wechat/*', ensureWechat);
  router.all('/wechat/*', ensureOpenId);
  router.get('/wechat/activity/:id/participate', require('../controller/wechat/activity/participate').view);
  

  // 错误页面
  router.all('/wechat-404.html', require('../controller/error/wechat-404').view);
  router.all('/wechat-500.html', require('../controller/error/wechat-500').view);
  router.all('/wechat-only.html', require('../controller/error/wechat-only').view);

  return router;
};


// 微信客户端检查
function ensureWechat(req, res, next) {
  let ua = req.get('User-Agent');
  if(ua && ua.indexOf('MicroMessenger') >= 0) {
    return next();
  } else {
    res.redirect(req.app.config.assetHost + '/wechat-only.html');
  }
}

// openId检查
function ensureOpenId(req, res, next) {
  let code = req.query['code'];
  if(code) {
    return Wechat.getOpenIdByCode(code).then((openId) => {
      req.query['openId'] = openId;
      next();
    }).catch((err) => {
      console.error(err, err.stack);
      res.status(500);
    });
  }
  let pathname = URL.parse(req.url).pathname;
  let currentUrl = URL.format({
    protocol: req.protocol,
    host: req.get('host').replace(':80', ''),
    port: req.get('port'),
    pathname
  });
  let redirectUrl = Wechat.getBaseAuthRedirectUrl(currentUrl);
  res.redirect(redirectUrl);
}

// 登录检查
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.set('X-Auth-Required', 'true');
  req.session.returnUrl = req.originalUrl;
  res.redirect('/auth/signIn');
}


// 管理权限检查
function ensureAdmin(req, res, next) {
  if (req.user.canPlayRoleOf('admin')) {
    return next();
  }
  res.status(403).send('您没有权限执行该操作').end();
}