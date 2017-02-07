'use strict';

var config = require('../config');
var request = require('request');
var async = require('async');
var fs = require('fs');
var XMLBuilder = require('xmlbuilder');
var debug = require('debug')('Pabao:services:wechat');
var schedule = require('node-schedule');
var util = require('./util');
var _ = require('lodash');

/**
 * 初始化微信后台
 * @param app
 */
function init(app) {
  let start = new Date().getTime();
  async.series([function (callback) {
    //更新accessToken
    updateAccessToken(app, function (err, data) {
      schedule.scheduleJob('0 0 * * * *', ()=>updateAccessToken(app));
      callback(err, data);
    });
  }, function (callback) {
    //更新JS API Ticket
    updateJSApiTicket(app, function (err, data) {
      schedule.scheduleJob('0 0 * * * *', ()=>updateJSApiTicket(app));
      callback(err, data);
    });
  }, function (callback) {
    if (config.wechatMenuUpdate) createCustomMenu(app, config.wechatMenu, callback);
    else callback(null, null);
  }, function (callback) {
    syncSubscriber(app, callback);
  }, function (callback) {
    require('./schedule-task').refreshDashboardData(app, 1 * 60 * 1000);
    require('./schedule-task').dailyStatistics(app);
    callback(null, null);
  }], function callback(err, data) {
    let end = new Date().getTime();
    if (err)
      console.error('Wechat modules init failed, time %sms, err: %s', end - start, err);
    else
      console.log('Wechat modules init success, time %sms', end - start);
  });
}

function updateAccessToken(app, callback) {
  var options = {
    url: 'https://api.weixin.qq.com/cgi-bin/token',
    method: 'GET',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    qs: {
      grant_type: 'client_credential',
      appid: appId,
      secret: secret
    }
  };
  wechatRequest(app, options, function (data) {
    setAccessToken(app.db.models.TokenCache, data.access_token, (err, token)=> {
      if (err) {
        console.log('Access token update error, %s.', err);
        if (callback) callback(err, null);
      } else {
        console.log('Access token updated, %s, timeout: %s', data.access_token, data.expires_in);
        if (callback) callback(null, data.access_token);
      }
    });
  }, function () {
    if (callback) callback('error', null);
  });
}

function updateJSApiTicket(app, callback) {
  var options = {
    url: 'https://api.weixin.qq.com/cgi-bin/ticket/getticket',
    method: 'GET',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    qs: {
      access_token: true,
      type: 'jsapi'
    }
  };
  wechatRequest(app, options, function (data) {
    setJsApiTicket(app.db.models.TokenCache, data.ticket, (err, token)=> {
      if (err) {
        console.log('Access token update error, %s.', err);
        if (callback) callback(err, null);
      } else {
        console.log('JS api ticket updated, %s, timeout: %s', data.ticket, data.expires_in);
        if (callback) callback(null, null);
      }
    });
  }, function () {
    if (callback) callback('error', null);
  });
}

function getAllSubscribersCacheInfo(app, startNo, endNo, sortBy, sortMethod, callback) {
  let Subscriber = app.db.models.Subscriber;
  Subscriber.count({subscribe: true}).exec((err1, count)=> {
    if (err1) return callback(err1, {subscribers: []}, 0);
    let query = Subscriber.find({subscribe: true}).select('openid lastActiveTime subscribeTime nickname sex headImgUrl wCountry wProvince wCity');
    if (sortBy) {
      if (sortBy === 'lastActiveTime') {
        query.sort({lastActiveTime: ((sortMethod === 'asc') ? 1 : -1)});
      } else {
        return callback(new Error('Unsupported sort field'));
      }
    } else {
      query.sort({subscribeTime: '-1'});
    }
    query.skip(startNo).limit(endNo - startNo).exec((err2, data)=> {
      callback(err2, {subscribers: data}, count);
    });
  });
}

function getAllOpenIdFromWechat(app, nextOpenId, dataHandler) {
  let openIdList = [];
  var options = {
    url: 'https://api.weixin.qq.com/cgi-bin/user/get',
    method: 'GET',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    qs: {
      access_token: true
    }
  };
  if (nextOpenId) options.qs.next_openid = nextOpenId;
  wechatRequest(app, options, function (data) {
    if (data.data) {
      openIdList = openIdList.concat(data.data.openid);
    }
    if (data.next_openid) {
      getAllOpenIdFromWechat(app, data.next_openid, function (data2) {
        if (data2.data) {
          openIdList = openIdList.concat(data2.data.openid);
        }
        dataHandler(openIdList);
      });
    } else {
      dataHandler(openIdList);
    }
  }, function () {
    console.error('Get user list from wechat error.');
  });
}

function createCustomMenu(app, menu, callback) {
  //格式化配置中的URL
  menu.button.map(b=> {
    if (b.sub_button && b.sub_button instanceof Array) {
      b.sub_button.map(sb => {
        if (sb.url !== undefined) {
          if (!sb.notRedirect) {
            sb.url = redirectURL(sb.url);
          }
        }
      });
    }
  });

  //删除旧菜单
  var deleteOptions = {
    url: 'https://api.weixin.qq.com/cgi-bin/menu/delete',
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json'
    },
    qs: {
      access_token: true
    }
  };

  //新菜单
  var newOptions = {
    url: 'https://api.weixin.qq.com/cgi-bin/menu/create',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    qs: {
      access_token: true
    },
    body: JSON.stringify(menu)
  };

  debug(`Menu to update, ${JSON.stringify(menu, null, 2)}`);

  wechatRequest(app, deleteOptions, function (data) {
    console.log('Menu deleted, result: %s', JSON.stringify(data));
    wechatRequest(app, newOptions, function (data) {
      console.log('Menu updated, result: %s', JSON.stringify(data));
      if (callback) callback(null, null);
    }, function () {
      console.error('Menu updated failed.');
      if (callback) callback('error', null);
    });
  }, function () {
    console.error('Menu deleted failed.');
    if (callback) callback('error', null);
  });
}

function getOpenIdOfCode(app, code, callback) {
  let COIC = app.db.models.CodeOpenIdCache;
  COIC.findOne({code: code}).exec((err, coic)=> {
    if (coic) {
      debug('Get openId from cache, code: %s, openid: %s', code, coic.openId);
      callback(coic.openId);
    } else {
      var options = {
        url: 'https://api.weixin.qq.com/sns/oauth2/access_token',
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        qs: {
          appid: appId,
          secret: secret,
          code: code,
          grant_type: 'authorization_code'
        }
      };
      wechatRequest(app, options, function (data) {
        debug('Get openid of code, code: %s, openid: %s', code, data.openid);

        //缓存OpenId和Code的对应关系，有效时间为5分钟
        let newItem = new COIC({code: code, openId: data.openid});
        newItem.save();

        callback(data.openid);
      }, function () {
        console.error('Get openid error');
      });
    }
  });
}

function replyHistoryArticles(app, openId, myId, dataHandler, errorHandler) {
  let Article = app.db.models.Article;
  require('../controllers/admin/message').getRecentPushArticles(app.db.models.PushRecord, 8, (err, articleIdList)=> {
    if (err) return errorHandler(err);
    if (articleIdList && articleIdList.length === 0) return errorHandler('NoArticle');
    if (articleIdList.length > 8) articleIdList.splice(8, articleIdList.length - 8);
    debug('History article to send: ' + JSON.stringify(articleIdList, null, 2));
    let query = Article.find({'_id': {$in: articleIdList}});
    query.select('_id title description cover createTime').populate('cover', '_id url ext').exec(function (err, array) {
      if (err) return errorHandler(err);
      let xml = XMLBuilder.create('xml');
      xml.ele('ToUserName').dat(openId);
      xml.ele('FromUserName').dat(myId);
      xml.ele('CreateTime').txt(new Date().getTime() / 1000);
      xml.ele('MsgType').dat('news');
      xml.ele('ArticleCount').txt(array.length);
      let articles = xml.ele('Articles');
      array.map(a=> {
        let item = articles.ele('item');
        item.ele('Title').dat(a.title);
        item.ele('Description').dat(a.description);
        if (a.cover) item.ele('PicUrl').dat(config.serverURL + a.cover.url);
        item.ele('Url').dat(redirectURL(config.serverURL + '/wechat/article/' + a._id));
      });
      let xmlStr = xml.end({
        pretty: true,
        indent: '  ',
        newline: '\n',
        allowEmpty: false
      });
      dataHandler(xmlStr);
    });
  });
}

function replyAnnouncements(app, openId, myId, dataHandler, errorHandler) {
  let Announcement = app.db.models.Announcement;
  Announcement.find({
    isDeleted: false,
    deadline: {$gt: new Date()}
  }).select('_id title description cover createTime').populate('cover', '_id url ext').sort({deadline: -1}).limit(8).exec((err, aArr)=> {
    if (err) {
      console.error(`Get announcement from db error.`);
      console.error(err);
      return errorHandler(err);
    }
    if (aArr && aArr.length === 0) return errorHandler('NoAnnouncement');
    debug('History article to send: ' + JSON.stringify(aArr, null, 2));
    let xml = XMLBuilder.create('xml');
    xml.ele('ToUserName').dat(openId);
    xml.ele('FromUserName').dat(myId);
    xml.ele('CreateTime').txt(new Date().getTime() / 1000);
    xml.ele('MsgType').dat('news');
    xml.ele('ArticleCount').txt(aArr.length);
    let articles = xml.ele('Articles');
    aArr.map(a=> {
      let item = articles.ele('item');
      item.ele('Title').dat(a.title);
      item.ele('Description').dat(a.description);
      if (a.cover) item.ele('PicUrl').dat(config.serverURL + a.cover.url);
      item.ele('Url').dat(config.serverURL + '/wechat/announcement/' + a._id);
    });
    let xmlStr = xml.end({
      pretty: true,
      indent: '  ',
      newline: '\n',
      allowEmpty: false
    });
    dataHandler(xmlStr);
  });
}

function replyNews(app, openId, myId, articleIds, callback) {
  if (!(articleIds instanceof Array)) articleIds = [articleIds];
  let Article = app.db.models.Article;
  Article.find({'_id': {$in: articleIds}, isDeleted: {$ne: true}}).exec((err, articleArray)=> {
    if (err) {
      console.error(err);
      return callback(err);
    }
    articleArray.sort((a1, a2)=> {
      return articleIds.indexOf(a1._id + '') - articleIds.indexOf(a2._id + '');
    });
    let xml = XMLBuilder.create('xml');
    xml.ele('ToUserName').dat(openId);
    xml.ele('FromUserName').dat(myId);
    xml.ele('CreateTime').txt(new Date().getTime() / 1000);
    xml.ele('MsgType').dat('news');
    xml.ele('ArticleCount').txt(articleArray.length + 1);
    let articles = xml.ele('Articles');
    articleArray.map(a=> {
      let item = articles.ele('item');
      item.ele('Title').dat(a.title);
      item.ele('Description').dat(a.description);
      if (a.cover) item.ele('PicUrl').dat(config.serverURL + a.cover.url);
      item.ele('Url').dat(redirectURL(config.serverURL + '/wechat/article/' + a._id));
    });
    let item = articles.ele('item');
    item.ele('Title').dat('完善您的个人信息获得更多积分');
    item.ele('Description').dat('完善您的个人信息获得更多积分');
    item.ele('PicUrl').dat(config.serverURL + '/img/logo.jpg');
    item.ele('Url').dat(redirectURL('/wechat/user/complete?openId=' + openId));
    let xmlStr = xml.end({
      pretty: true,
      indent: '  ',
      newline: '\n',
      allowEmpty: false
    });
    //console.log(xmlStr);
    callback(null, xmlStr);
  });
}

function replyText(app, openId, myId, msg, dataHandler) {
  let xml = XMLBuilder.create('xml');
  xml.ele('ToUserName').dat(openId);
  xml.ele('FromUserName').dat(myId);
  xml.ele('CreateTime').txt(new Date().getTime() / 1000);
  xml.ele('MsgType').dat('text');
  xml.ele('Content').dat(msg);
  let xmlStr = xml.end({
    pretty: true,
    indent: '  ',
    newline: '\n',
    allowEmpty: false
  });
  dataHandler(xmlStr);
}

function isSubscriber(app, openId, callback) {
  getSubscriberInfo(app, openId, function (err, data) {
    if (err) {
      callback(err, null);
    } else {
      if (data && data.subscribe) {
        callback(null, true);
      } else {
        callback(null, false);
      }
    }
  });
}

function isSubscriberFromCache(app, openId, callback) {
  app.db.models.Subscriber.count({openId: openId, subscribe: true}).exec((err, number)=> {
    if (err) return callback(err);
    if (number > 0) callback(null, true);
    else isSubscriber(app, openId, callback);
  });
}

function getSubscriberInfo(app, openId, callback) {
  var options = {
    url: 'https://api.weixin.qq.com/cgi-bin/user/info',
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    },
    qs: {
      access_token: true,
      openid: openId,
      lang: 'zh_CN'
    }
  };
  wechatRequest(app, options, function (data) {
    updateSubscribersInfoCache(app, data, ()=>(callback(null, data)));
  }, function () {
    if (arguments && arguments[0] && arguments[0] === 45009) {
      //如果单次获取用户信息接口达到上限，则使用批量获取接口
      batchGetSubscriberInfo(app, openId, (err, data)=> {
        if (err) return callback(err, null);
        if (data && data.subscribers[0]) return updateSubscribersInfoCache(app, data, ()=>(callback(null, data.subscribers[0])));
        callback('error access wechat service', null);
      });
    } else {
      callback('error access wechat service', null);
    }
  });
}

function batchGetSubscriberInfo(app, openId, callback) {
  (openId instanceof Array) || (openId = [openId]);
  if (openId.length === 0) return callback(null, {subscribers: []});
  openId = util.uniqueArray(openId);
  let userList = [];
  openId.map(i=> {
    userList.push({openid: i, lang: 'zh_CN'})
  });
  var options = {
    url: 'https://api.weixin.qq.com/cgi-bin/user/info/batchget',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    qs: {
      access_token: true
    },
    body: {user_list: userList},
    json: true
  };
  wechatRequest(app, options, function (data) {
    updateSubscribersInfoCache(app, data.user_info_list, ()=> {
      callback(null, {subscribers: data.user_info_list});
    });
  }, function () {
    callback('error access wechat service', null);
  });
}

function batchUploadWechatImage(app, mediaArray, callback) {
  let newMediaArray = [];
  if (mediaArray.length === 0) return callback(null, newMediaArray);
  async.each(mediaArray, function (media, callbackIn) {
    uploadWechatImage(app, media, function (err, data) {
      newMediaArray.push(data);
      callbackIn(err);
    });
  }, function (err) {
    callback(err, newMediaArray);
  })
}

function uploadWechatImage(app, media, callback) {
  let formData = {
    media: fs.createReadStream(media.path)
  };
  let options = {
    url: 'https://api.weixin.qq.com/cgi-bin/material/add_material',
    method: 'POST',
    qs: {
      access_token: true,
      type: 'thumb'
    },
    formData: formData
  };
  wechatRequest(app, options, function (data) {
    let mediaId = data.media_id,
      url = data.url,
      Media = app.db.models.Media;
    Media.findOneAndUpdate({_id: media._id}, {wechat: {mediaId: mediaId, url: url}}, {new: 1}, function (err, data) {
      (err) ? (callback('Media upload success and get a media_id: ' + data.media_id + ', but save to data base failed. err: ' + JSON.stringify(err), null)) : (callback(null, data));
    });
  }, function () {
    callback('Media upload to wechat failed', null);
  });
}

function uploadNews(app, articles, callback) {
  let options = {
    url: 'https://api.weixin.qq.com/cgi-bin/material/add_news',
    method: 'POST',
    qs: {
      access_token: true
    },
    body: {articles: articles},
    json: true
  };
  wechatRequest(app, options, function (data) {
    console.log({uploadNews: data});
    callback(null, data);
  }, function () {
    callback('upload news error.');
  });
}

function pushNews(app, mediaId, callback) {
  let options = {
    url: 'https://api.weixin.qq.com/cgi-bin/message/mass/sendall',
    method: 'POST',
    qs: {
      access_token: true
    },
    body: {
      filter: {
        is_to_all: false,
        group_id: 0
      },
      mpnews: {
        media_id: mediaId
      },
      msgtype: 'mpnews'
    },
    json: true
  };
  wechatRequest(app, options, function (data) {
    console.log({pushNews: data});
    callback(null, data);
  }, function () {
    callback('push news error.');
  })
}

function pushMpnewsThroughCustomMessage(app, mediaId, callback) {
  let successUsers = [];
  let failedUsers = [];
  app.db.models.OpenIdCache.find({}).exec((err, users)=> {
    if (err) return callback(err);
    let openIdList = [];
    users.map(u=>openIdList.push(u.openId));
    async.map(openIdList, function (user, callback) {
      var options = {
        url: 'https://api.weixin.qq.com/cgi-bin/message/custom/send',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json;charset:utf-8'
        },
        json: true,
        qs: {
          access_token: true
        },
        body: {
          "touser": user,
          "msgtype": "mpnews",
          "mpnews": {
            "media_id": mediaId
          }
        }
      };
      wechatRequest(app, options, function (data) {
        console.log('Send custom message to user[%s], ret %s', user, JSON.stringify(data));
        callback(null, {successUsers: [user], failedUsers: []});
      }, function () {
        console.error('Send custom message to user[%s] failed', user);
        callback(null, {successUsers: [], failedUsers: [user]});
      });
    }, function (err, results) {
      results.map(r=> {
        successUsers = successUsers.concat(r.successUsers);
        failedUsers = failedUsers.concat(r.failedUsers);
      });
      callback(null, {successUsers: successUsers, failedUsers: failedUsers});
    });
  });
}

function pushNewsThroughCustomMessage(app, articles, callback) {
  let successUsers = [];
  let failedUsers = [];
  app.db.models.Subscriber.find({subscribe: true}).select('openid').exec((err, users)=> {
    if (err) return callback(err);
    let openIdList = [];
    users.map(u=>openIdList.push(u.openid));
    async.mapLimit(openIdList, 1, function (user, callback) {
      var options = {
        url: 'https://api.weixin.qq.com/cgi-bin/message/custom/send',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json;charset:utf-8'
        },
        json: true,
        qs: {
          access_token: true
        },
        body: {
          "touser": user,
          "msgtype": "news",
          "news": {
            "articles": articles
          }
        }
      };
      wechatRequest(app, options, function (data) {
        console.log('Send custom message to user[%s], ret %s', user, JSON.stringify(data));
        callback(null, {successUsers: [user], failedUsers: []});
      }, function () {
        console.error('Send custom message to user[%s] failed', user);
        callback(null, {successUsers: [], failedUsers: [user]});
      });
    }, function (err, results) {
      results.map(r=> {
        successUsers = successUsers.concat(r.successUsers);
        failedUsers = failedUsers.concat(r.failedUsers);
      });
      callback(null, {successUsers: successUsers, failedUsers: failedUsers});
    });
  });
}

function batchGenerateQRCode(app, sceneStrArray, callback) {
  (!(sceneStrArray instanceof Array)) && (sceneStrArray = [sceneStrArray]);
  async.eachSeries(sceneStrArray, (i, cb)=> {
    generateQRCode(app, i, cb);
  }, (err)=> {
    if (err) {
      console.error(err);
      callback(new Error(`Batch get QRCode error.`));
    }
    callback();
  });
}

function generateQRCode(app, sceneStr, callback) {
  let QRCode = app.db.models.QRCode;
  var options = {
    url: 'https://api.weixin.qq.com/cgi-bin/qrcode/create',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    qs: {
      access_token: true
    },
    body: {
      action_name: 'QR_LIMIT_STR_SCENE',
      action_info: {
        scene: {
          scene_str: sceneStr
        }
      }
    },
    json: true
  };
  wechatRequest(app, options, function (data) {
    debug(JSON.stringify(data, null, 2));
    let qr = new QRCode({
      ticket: data.ticket,
      url: data.url,
      sceneStr: sceneStr
    });
    qr.save((err)=> {
      if (err) {
        console.error(err);
        callback(new Error(`Get QRCode from wechat service success. ${JSON.stringify(data)}. Save to db error.`));
      }
      callback(null, data);
    })
  }, function () {
    callback(new Error(`Get QRCode form wechat service error. SceneStr: ${sceneStr}`));
  });
}

exports.init = init;
exports.replyHistoryArticles = replyHistoryArticles;
exports.getOpenIdOfCode = getOpenIdOfCode;
exports.replyText = replyText;
exports.replyAnnouncements = replyAnnouncements;
exports.isSubscriber = isSubscriber;
exports.getSubscriberInfo = getSubscriberInfo;
exports.getAllSubscribersCacheInfo = getAllSubscribersCacheInfo;
exports.batchUploadWechatImage = batchUploadWechatImage;
exports.uploadNews = uploadNews;
exports.pushNews = pushNews;
exports.redirectURL = redirectURL;
exports.pushMpnewsThroughCustomMessage = pushMpnewsThroughCustomMessage;
exports.pushNewsThroughCustomMessage = pushNewsThroughCustomMessage;
exports.batchGetSubscriberInfo = batchGetSubscriberInfo;
exports.isSubscriberFromCache = isSubscriberFromCache;
exports.redirectURL = redirectURL;
exports.getJsApiTicket = getJsApiTicket;
exports.generateQRCode = generateQRCode;
exports.batchGenerateQRCode = batchGenerateQRCode;
exports.replyNews = replyNews;
exports.syncSubscriber = syncSubscriber;

function wechatRequest(app, options, dataHandler, errorHandler) {
  let retryTime = 0,
    TokenCache = app.db.models.TokenCache,
    EventEmitter = require('events').EventEmitter;

  let event = new EventEmitter();
  event.on('fail', (err, msg)=> {
    console.error(msg);
    console.error(err);
    errorHandler();
  });
  event.on('finish', (data)=> {
    dataHandler(data);
  });
  event.on('timeout', (options)=> {
    retryTime++;
    if (retryTime >= 3)
      return event.emit('fail', new Error('ETIMEDOUT'), `Request to wechat service timeout, retry time: ${retryTime}`);
    else
      return event.emit('ready', options);
  });
  event.on('prepare', ()=> {
    options.timeout = config.wechatTimeout;
    setRequestOptionsToken(TokenCache, options, (err, options)=> {
      (err) ? (event.emit('fail', err, 'Set access token to request option error.')) : (event.emit('ready', options));
    });
  });
  event.on('ready', (options)=> {
    request(options, function (error, response, body) {

      //Log output
      let reqTime = new Date();
      let dateStr = reqTime.getFullYear() + '-' + (reqTime.getMonth() + 1) + '-' + reqTime.getDate() + '/'
        + reqTime.getHours() + ':' + reqTime.getMinutes() + ':' + reqTime.getSeconds() + '.' + reqTime.getMilliseconds();
      console.log(`[${dateStr}] [WechatRequest] \n -> [Options] ${JSON.stringify(options, null, 2)} \n -> [Error] ${JSON.stringify(error, null, 2)} \n -> [Body] ${(body)?JSON.stringify(JSON.parse(body), null, 2):'_EMPTY_'}`);

      if (error || (response.statusCode !== 200))
        if (error.message == 'ETIMEDOUT')
          return event.emit('timeout', options);
        else
          return event.emit('fail', error, `Received an error from wechat server, code: ${response.statusCode}`);
      (typeof body === 'string') && (body = JSON.parse(body));
      if (body.errcode && body.errcode !== 0) {
        if (body.errcode === 40001 || body.errcode === 40014 || body.errcode === 42001) {
          return event.emit('err-token');
        } else if (body.errcode === 45009) {
          return event.emit('fail', new Error(45009), `Wechat API [${options.url}] reach limit.`);
        } else {
          return event.emit('fail', new Error('Wechat service error'), `Request to wechat service error, body: ${JSON.stringify(body)}`);
        }
      } else {
        return event.emit('finish', body);
      }
    });
  });
  event.on('err-token', ()=> {
    console.error('Access token error, try to refresh access_token. Old access_token %s. error: %s', options.qs.access_token, JSON.stringify(body));
    updateAccessToken(app, (err)=> {
      (err) ? (event.emit('fail', err, `Refresh access_token error.`)) : (event.emit('prepare'));
    });
  });

  event.emit('prepare');
}

function redirectURL(url) {
  if (url.length === 0) {
    url = '/wechat/developing';
  }
  if (url.indexOf('/') === 0) {
    url = config.serverURL + url;
  }
  return 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=' + appId + '&redirect_uri=' + encodeURI(url) + '&response_type=code&scope=snsapi_base&state=123#wechat_redirect';
}

function getAccessToken(TokenCache, callback) {
  TokenCache.findOne({}).exec((err, tokenCache)=> {
    if (err) callback(err, null);
    else callback(null, tokenCache.accessToken);
  })
}

function getJsApiTicket(TokenCache, callback) {
  TokenCache.findOne({}).exec((err, tokenCache)=> {
    if (err) callback(err, null);
    else callback(null, tokenCache.jsApiTicket);
  })
}

function setAccessToken(TokenCache, accessToken, callback) {
  TokenCache.findOneAndUpdate({}, {accessToken: accessToken}, {upsert: 1}, (err, data)=> {
    callback && callback(err, accessToken);
  });
}

function setJsApiTicket(TokenCache, jsApiTicket, callback) {
  TokenCache.findOneAndUpdate({}, {jsApiTicket: jsApiTicket}, {upsert: 1}, (err, data)=> {
    callback && callback(err, jsApiTicket);
  });
}

function setRequestOptionsToken(TokenCache, options, callback) {
  if (options.qs && options.qs.access_token) {
    getAccessToken(TokenCache, (err, accessToken)=> {
      if (err) {
        console.error('Get accessToken from db error! %s', err);
        if (callback) return callback(err);
      } else {
        options.qs.access_token = accessToken;
        return callback(err, options);
      }
    });
  } else {
    return callback(null, options);
  }
}

function syncSubscriber(app, callback) {
  let Subscriber = app.db.models.Subscriber,
    EventEmitter = require('events').EventEmitter;
  let finishCheck = {main: false, path1: false};

  let event = new EventEmitter();
  event.on('error', (err, msg)=> {
    console.log('[WechatSync] ERROR Error occurred, exit sync.');
    console.error('[WechatSync] ERROR ' + msg);
    console.error(err);
    callback(err);
  });
  event.on('finish', ()=> {
    if (finishCheck.main && finishCheck.path1) {
      console.log('[WechatSync] FINISH. Sync success.');
      callback();
    }
  });
  //Step1 获取微信端openId列表
  event.on('step1', ()=> {
    console.log('[WechatSync] STEP1 Get openId list from wechat.');
    getAllOpenIdFromWechat(app, null, (wechatOpenIdArray)=> {
      //debug(`wechatOpenIdArray: ${JSON.stringify(wechatOpenIdArray, null, 2)}`);
      event.emit('step2', wechatOpenIdArray);
    });
  });
  //Step2 获取数据库中正在关注的openId列表
  event.on('step2', (wechatOpenIdArray)=> {
    console.log('[WechatSync] STEP2 Get openId list from database.');
    Subscriber.find({subscribe: true}).select('openid').exec((err, dbObjectArray)=> {
      let dbOpenIdArray = [];
      dbObjectArray.map(i=> (i && i.openid) && (dbOpenIdArray.push(i.openid)));
      //debug(`dbOpenIdArray: ${JSON.stringify(dbOpenIdArray, null, 2)}`);
      event.emit('step3', wechatOpenIdArray, dbOpenIdArray);
    });
  });
  //Step3 将数据库中缺失的openId添加到数据库中
  event.on('step3', (wechatOpenIdArray, dbOpenIdArray)=> {
    console.log('[WechatSync] STEP3 Get new openIds.');
    let toAdd = [];
    wechatOpenIdArray.map(i=>((dbOpenIdArray.indexOf(i) < 0) && toAdd.push(i)));
    //debug(`toAdd: ${JSON.stringify(toAdd, null, 2)}`);
    //分支步骤：1.如果有新增用户则进入用户轮询状态；2.若无则进入信息更新状态
    if (toAdd.length > 0) {
      console.log(`[WechatSync] STEP3 Start add new openIds into db. Num: ${toAdd.length}.`);
      event.emit('addOpenId', toAdd, 0, []);
    } else
      event.emit('step4', []);
    //支线：用户取关，更新失败不影响主同步流程
    let toUnsubscribe = [];
    dbOpenIdArray.map(i=>((wechatOpenIdArray.indexOf(i) < 0) && toUnsubscribe.push(i)));
    if (toUnsubscribe.length > 0) {
      console.log(`[WechatSync] STEP-ADD Update unsubscribers to db. Num: ${toUnsubscribe.length}.`);
      event.emit('removeOpenId', toUnsubscribe, 0);
    } else {
      finishCheck.path1 = true;
    }
  });
  //Step支线 用户取关，更新数据库中openId的状态
  event.on('removeOpenId', (toUnsubscribeOpenIdArray, index)=> {
    if (index < toUnsubscribeOpenIdArray.length) {
      let openId = toUnsubscribeOpenIdArray[index];
      console.log(`[WechatSync] STEP-ADD Update unsubscriber openId[${openId}] to db. Index: ${index}.`);
      Subscriber.findOneAndUpdate({openid: openId}, {subscribe: false}, (err)=> {
        if (err) {
          console.error(`[WechatSync] STEP-ADD Fail update unsubscriber openId[${openId}] to db. Index: ${index}.`);
          console.error(err);
        }
        process.nextTick(()=>event.emit('removeOpenId', toUnsubscribeOpenIdArray, index + 1));
      });
    } else {
      console.log(`[WechatSync] STEP-ADD Finish update unsubscribers to db.`);
      finishCheck.path1 = true;
      event.emit('finish');
    }
  });
  //Step3.1 轮询openId，更新数据库中openId的状态。若有取关重新关注者，则需在后续步骤中更新其个人信息
  event.on('addOpenId', (toAddOpenIdArray, index, toUpdate)=> {
    if (index < toAddOpenIdArray.length) {
      let toAddOpenId = toAddOpenIdArray[index];
      console.log(`[WechatSync] STEP3 Check OpenId[${toAddOpenId}] database status.`);
      Subscriber.findOne({openid: toAddOpenId}, (err, one)=> {
        if (err) {
          event.emit('error', err, `Check OpenId[${toAddOpenId}] database status error.`)
        } else {
          if (one) {  //数据库中存在该数据，则更新其状态为subscribe，加入资料待更新列表
            console.log(`[WechatSync] STEP3 OpenId[${toAddOpenId}] is old data, update info.`);
            one.subscribe = true;
            toUpdate.push(one.openid);
            one.save((err)=> {
              if (err) {
                event.emit('error', err, `Update OpenId[${toAddOpenId}] database status error.`)
              } else {
                process.nextTick(()=>event.emit('addOpenId', toAddOpenIdArray, index + 1, toUpdate));
              }
            });
          } else {  //数据库中不存在该数据，则新建数据写入数据库
            console.log(`[WechatSync] STEP3 OpenId[${toAddOpenId}] is new, save info.`);
            let newOne = new Subscriber({openid: toAddOpenId});
            newOne.save((err)=> {
              if (err) {
                event.emit('error', err, `Save OpenId[${toAddOpenId}] error.`)
              } else {
                process.nextTick(()=>event.emit('addOpenId', toAddOpenIdArray, index + 1, toUpdate));
              }
            });
          }
        }
      });
    } else {
      console.log(`[WechatSync] STEP3 Finish OpenIds add.`);
      event.emit('step4', toUpdate);
    }
  });
  //Step4 从数据库中读取信息不全的openId列表
  event.on('step4', (toUpdateOpenIdArray)=> {
    console.log('[WechatSync] STEP4 Update subscriber info.');
    Subscriber.find({nickname: {$exists: false}}).select('openid').exec((err, toUpdateObjectArray)=> {
      if (err) {
        event.emit('error', err, `Get OpenIds to update error.`)
      } else {
        toUpdateObjectArray.map(i=>((i && i.openid) && (toUpdateOpenIdArray.push(i.openid))));
        //debug(`toUpdateOpenIdArray: ${JSON.stringify(toUpdateOpenIdArray, null, 2)}`);
        event.emit('step5', toUpdateOpenIdArray, 0, []);
      }
    });
  });
  //Step5 根据要更新用户信息的openId列表从微信拉取用户信息，每次拉取100条
  event.on('step5', (toUpdateOpenIdArray, count, infoList)=> {
    if ((100 * count) < toUpdateOpenIdArray.length) {
      console.log(`[WechatSync] STEP5 Get subscriber info from wechat. Sum: ${toUpdateOpenIdArray.length}. Count: ${count}.`);
      let toGet = toUpdateOpenIdArray.slice(count * 100, (count + 1) * 100);
      batchGetSubscriberInfo(app, toGet, (err, data)=> {
        if (err) {
          event.emit('error', err, `Get OpenIds info from wechat error. Count: ${count}`);
        } else {
          infoList = infoList.concat(data.subscribers);
          //debug(`infoList: ${JSON.stringify(infoList, null, 2)}`);
          process.nextTick(()=>event.emit('step5', toUpdateOpenIdArray, count + 1, infoList));
        }
      });
    } else {
      event.emit('step6', infoList);
    }
  });
  //Step6 将获取到的用户信息更新到数据库
  event.on('step6', (infoList)=> {
    let index = 0;
    console.log(`[WechatSync] STEP6 Start update db OpenIds info. Num: ${infoList.length}.`);
    event.emit('updateInfo', infoList, index);
  });
  //Step6.1 轮询
  event.on('updateInfo', (infoList, index)=> {
    if (index < infoList.length) {
      let info = infoList[index];
      console.log(`[WechatSync] STEP6 Update db OpenId info. OpenId: ${info.openid}. Index: ${index}`);
      Subscriber.findOneAndUpdate({openid: info.openid}, {
        subscribe: true,
        subscribeTime: new Date(info.subscribe_time * 1000),
        nickname: info.nickname,
        sex: info.sex,
        headImgUrl: info.headimgurl,
        wCity: info.city,
        wProvince: info.province,
        wCountry: info.country
      }, (err)=> {
        if (err) {
          event.emit('error', err, `Update db OpenIds info error. OpenId: ${info.openid}. Info: ${JSON.stringify(info, null, 2)}`);
        } else {
          process.nextTick(()=>event.emit('updateInfo', infoList, index + 1));
        }
      });
    } else {
      finishCheck.main = true;
      event.emit('finish');
    }
  });
  console.log('[WechatSync] Start synchronize subscriber info.');
  event.emit('step1');
}

function updateSubscribersInfoCache(app, wechatInfoArr, callback) {
  let Subscriber = app.db.models.Subscriber;
  (wechatInfoArr instanceof Array) && (wechatInfoArr = [wechatInfoArr]);
  debug(JSON.stringify(wechatInfoArr, null, 2));

  async.each(wechatInfoArr, (item, cb)=> {
    if (item.subscribe) {
      Subscriber.findOneAndUpdate({openid: item.openid}, {
        subscribe: true,
        subscribeTime: new Date(item.subscribe_time * 1000),
        nickname: item.nickname,
        sex: item.sex,
        headImgUrl: item.headimgurl,
        wCity: item.city,
        wProvince: item.province,
        wCountry: item.country
      }, (err)=> {
        if (err) {
          console.error(`Update db cache subscriber info error. OpenId: ${item.openid}. Info: ${JSON.stringify(item, null, 2)}`);
          console.error(err);
          cb(err);
        } else {
          cb();
        }
      });
    } else {
      cb();
    }
  }, (err)=> {
    if (err) {
      console.error("updateSubscribersInfoCache failed");
    }
    callback();
  });
}
