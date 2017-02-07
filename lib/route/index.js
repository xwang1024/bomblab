'use strict';

var express = require('express');
var router = express.Router();

module.exports = function () {
  router.get('/', (req, res) => {
    res.send('Hello');
  })
  router.get('/wechat/api/access', require('../controller/wechat').wechatValidation);
  // router.post('/wechat/api/access', require('../controller/wechat').processWechatEvent);

  // router.get('/common/api/province', require('./controller/common/location').getProvinceList);
  // router.get('/common/api/province/:pname/city', require('./controller/common/location').getCityList);
  // router.get('/common/api/province/:pname/city/:cname/district', require('./controller/common/location').getDistrictList);
  // router.post('/common/api/subscribers', require('./controller/common/subscriber').newSubscriber);
  // router.put('/common/api/subscribers/:openId', require('./controller/common/subscriber').completeInfo);
  // router.get('/common/api/subscribers/:openId', require('./controller/common/subscriber').getSubscriber);
  // router.get('/common/api/subscribers/:openId/questionAnswers', require('./controller/admin/question').getQuestionAnswerOfSubscriber);
  // router.get('/common/api/subscribers/:openId/scaleAnswers', require('./controller/admin/scale').getScaleAnswerOfSubscriber);
  // router.get('/common/api/hospitals/province/:pname', require('./controller/common/hospital').getHospitalList);
  // router.get('/common/api/phone/code', require('./controller/common/phone').getPhoneCode);

  // router.get('/signIn', require('./controller/admin/view/auth').signIn);
  // router.get('/signUp', require('./controller/admin/view/auth').signUp);
  
  // router.post('/signIn', require('./controller/admin/auth').signIn);
  // router.post('/signUp', require('./controller/admin/auth').signUp);
  // router.all('/signOut', require('./controller/admin/auth').signOut);

  // router.all('/admin*', ensureAuthenticated)
  // router.post('/admin/api/scales', require('./controller/admin/scale').newScale);// action=preview为预览，其他情况为新建
  // router.get('/admin/api/scales', require('./controller/admin/scale').getScaleList);
  // router.get('/admin/api/scales/active', require('./controller/admin/scale').getActiveScaleList);
  // router.get('/admin/api/scale/active', require('./controller/admin/scale').getActiveScale);
  // router.get('/admin/api/scale/:id', require('./controller/admin/scale').getScale);
  // router.put('/admin/api/scale/:id', require('./controller/admin/scale').updateScale);// action=active为激活，disable为禁用，其他情况为更新
  // router.delete('/admin/api/scale/:id', require('./controller/admin/scale').deleteScale);
  // router.get('/admin/api/scales/answers/:openid', require('./controller/admin/scale').getScaleAnswer);

  // router.get('/admin/api/media/editor', require('./controller/admin/media').getEditorConfig);
  // router.get('/admin/api/media/tags', require('./controller/admin/media').getMediaTags);
  // router.get('/admin/api/media/tagHints', require('./controller/admin/media').getHintTags);
  // router.get('/admin/api/media/articles/tags', require('./controller/admin/media').getArticleTags);
  // router.get('/admin/api/media/articles/tagHints', require('./controller/admin/media').getArticleTagHints);
  // router.get('/admin/api/media/articles/:id', require('./controller/admin/media').getArticle);
  // router.get('/admin/api/media/articles', require('./controller/admin/media').getArticleList);
  // router.get('/admin/api/media/*', require('./controller/admin/media').getMediaList);
  // router.post('/admin/api/media/articles', require('./controller/admin/media').newArticle);
  // router.post('/admin/api/media/*', require('./controller/admin/media').uploadMedia);
  // router.put('/admin/api/media/articles/:id', require('./controller/admin/media').updateArticle);
  // router.put('/admin/api/media/:id', require('./controller/admin/media').updateMediaInfo);
  // router.delete('/admin/api/media/articles/:id', require('./controller/admin/media').deleteArticle);
  // router.delete('/admin/api/media/:id', require('./controller/admin/media').deleteMedia);

  // router.post('/admin/api/questions', require('./controller/admin/question').newQuestion);
  // router.delete('/admin/api/questions/:id', require('./controller/admin/question').deleteQuestion);
  // router.put('/admin/api/questions/:id', require('./controller/admin/question').updateQuestion);
  // router.get('/admin/api/questions/tags', require('./controller/admin/question').getQuestionTags);
  // router.get('/admin/api/questions/tagHints', require('./controller/admin/question').getQuestionTagHints);
  // router.get('/admin/api/questions/:id', require('./controller/admin/question').getQuestion);
  // router.get('/admin/api/questions', require('./controller/admin/question').getQuestionList);

  // router.post('/admin/api/qrcode', require('./controller/admin/qrcode').batchCreate);
  // router.put('/admin/api/qrcode/:id', require('./controller/admin/qrcode').update);

  // router.put('/admin/api/subscribers/:openId/point', require('./controller/common/subscriber').changePoint);
  // router.delete('/admin/api/recommendations/:rid', require('./controller/wechat/recommend').deleteRecommendation);

  // router.post('/admin/api/message/mpnews', require('./controller/admin/message').pushMpnews);
  // router.post('/admin/api/message/news', require('./controller/admin/message').pushNews);
  // router.get('/admin/api/message/records', require('./controller/admin/message').getPushRecord);

  // router.get('/admin/api/userAnalyse/graph', require('./controller/admin/statistics').getGraphData);
  // router.get('/admin/api/userAnalyse/subscribers', require('./controller/admin/statistics').getSubscribersData);

  // router.post('/admin/api/announcements', require('./controller/admin/announcement').create);
  // router.put('/admin/api/announcements/:id', require('./controller/admin/announcement').update);
  // router.delete('/admin/api/announcements/:id', require('./controller/admin/announcement').delete);

  // router.get('/admin/test/chart', require('./controller/test').getChart);
  // router.get('/admin/test/activeUser', require('./controller/test').getActiveUser);

  // router.post('/wechat/api/scale/:id/answers/:openid', require('./controller/admin/scale').newScaleAnswer);
  // router.get('/wechat/api/scales/answers/:openid', require('./controller/admin/scale').getScaleAnswer);
  // router.post('/wechat/api/questions/:id/answers', require('./controller/admin/question').newAnswer);
  // router.post('/wechat/api/media/articles/:id/report', require('./controller/admin/media').newArticleReport);
  // router.post('/wechat/api/media/articles/:id/comments', require('./controller/admin/media').newArticleComment);
  // router.get('/wechat/api/media/articles/:id/comments', require('./controller/admin/media').getArticleComment);
  // router.put('/wechat/api/media/articles/:aid/comments/:cid', require('./controller/admin/media').thumbsUpArticleComment);//action=up为赞同，undoUp为取消赞同
  // router.post('/wechat/api/media/articles/:id/share', require('./controller/admin/media').shareArticle);
  // router.post('/wechat/api/recommendations', require('./controller/wechat/recommend').newRecommendation);
  // router.get('/wechat/api/recommendations', require('./controller/wechat/recommend').getRecommendations);
  // router.put('/wechat/api/recommendations/:rid', require('./controller/wechat/recommend').thumbsUpRecommendation);//action=up为赞同
  // router.put('/wechat/api/games/dataCollect', require('./controller/wechat/game').dataCollect);//目前name为shake
  // router.put('/wechat/api/games/:name', require('./controller/wechat/game').gameSettlement);//目前name为shake

  // router.get('/', (req, res) => { return res.redirect('/admin') });
  // router.get('/admin', require('./controller/admin/view/index').index);
  // router.get('/admin/dashboard', require('./controller/admin/view/dashboard').index);
  // router.get('/admin/changePassword', require('./controller/admin/view/account').changePassword);
  // router.get('/admin/scale', require('./controller/admin/view/scale').index);
  // router.get('/admin/scale/upload', require('./controller/admin/view/scale').upload);
  // router.get('/admin/scale/:id', require('./controller/admin/view/scale').detail);
  // router.get('/admin/feature/groupSend', require('./controller/admin/view/feature').groupSend);
  // router.get('/admin/feature/groupSend/log', require('./controller/admin/view/feature').groupSendLog);
  // router.get('/admin/feature/messageBoard', require('./controller/admin/view/feature').messageBoard);
  // router.get('/admin/feature/doctorVote', require('./controller/admin/view/feature').doctorVote);
  // router.get('/admin/feature/userAnalysis', require('./controller/admin/view/feature').userAnalysis);
  // router.get('/admin/media/article', require('./controller/admin/view/media').article);
  // router.get('/admin/media/article/create', require('./controller/admin/view/media').articleCreate);
  // router.get('/admin/media/article/modify/:id', require('./controller/admin/view/media').articleModify);
  // router.get('/admin/media/image', require('./controller/admin/view/media').image);
  // router.get('/admin/media/audio', require('./controller/admin/view/media').audio);
  // router.get('/admin/media/video', require('./controller/admin/view/media').video);
  // router.get('/admin/media/video/upload', require('./controller/admin/view/media').videoUpload);
  // router.get('/admin/media/question', require('./controller/admin/view/media').question);
  // router.get('/admin/user', require('./controller/admin/view/user').index);
  // router.get('/admin/user/:openid', require('./controller/admin/view/user').detail);
  // router.get('/admin/user/:openid/scale/record', require('./controller/admin/view/user').scaleRecord);
  // router.get('/admin/user/:openid/scale/record/:id', require('./controller/admin/view/user').recordDetail);
  // router.get('/admin/qrcode', require('./controller/admin/view/qrcode').index);
  // router.get('/admin/announcement', require('./controller/admin/view/announcement').index);
  // router.get('/admin/announcement/create', require('./controller/admin/view/announcement').create);
  // router.get('/admin/announcement/modify/:id', require('./controller/admin/view/announcement').modify);

  // router.all('/admin/root*', ensureAdmin);
  // router.get('/admin/root/account', require('./controller/admin/view/account').index);
  // router.post('/admin/root/api/account', require('./controller/admin/account').create);
  // router.put('/admin/root/api/account/:id', require('./controller/admin/account').update);
  // router.delete('/admin/root/api/account/:id', require('./controller/admin/account').delete);
  
  // router.get('/wechat/*', require('./controller/wechat/filter').filter);
  // router.get('/wechat/*', require('./controller/wechat/filter').sign);
  // router.get('/wechat/*', require('./controller/wechat/filter').point);
  // router.get('/wechat/agreement', require('./controller/wechat/view/agreement').index);
  // router.get('/wechat/user/complete', require('./controller/wechat/view/user').complete);
  // router.get('/wechat/scale', require('./controller/wechat/view/scale').index);
  // router.get('/wechat/scale/record', require('./controller/wechat/view/scale').record);
  // router.get('/wechat/scale/:id', require('./controller/wechat/view/scale').detail);
  // router.get('/wechat/article/:id', require('./controller/wechat/view/article').index);
  // router.get('/wechat/announcement/:id', require('./controller/wechat/view/announcement').index);
  // router.get('/wechat/doctor-vote', require('./controller/wechat/view/doctor-vote').index);
  // router.get('/wechat/tree-game', require('./controller/wechat/view/tree-game').index);
  // router.get('/wechat/about', require('./controller/wechat/view/about').index);
  // router.get('/wechat/common-question', require('./controller/wechat/view/common-question').index);
  // router.get('/wechat/share/scale-result/:id', require('./controller/wechat/view/share').scaleResult);
  // router.get('/wechat/share/tree-game-result/:id', require('./controller/wechat/view/share').treeGameResult);
  // router.get('/wechat/shake-data-obtainer', require('./controller/wechat/view/shake-data-obtainer').index);
  // router.get('/wechat/developing', require('./controller/wechat/view/developing').show);

  // router.get('/shake', require('./controller/test').shake);
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