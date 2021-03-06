'use strict';

const fs      = require('fs');
const _       = require('lodash');
const debug   = require('debug')('Wechat');
const crypto  = require('crypto');
const request = require('request');
const Cache   = require('./Cache');

const ACCESS_TOKEN_KEY = 'accessToken';
const MATERIAL_TYPE = {
  IMAGE: 'image',
  // VOICE: 'voice',
  // NEWS: 'news',
}

let appid = null;
let secret = null;
let token = null;
let AESKey = null;
let timeoutMillis = 5000;

exports.MATERIAL_TYPE = MATERIAL_TYPE;
exports.init = init;
exports.validateSignature = validateSignature;
exports.updateAccessToken = updateAccessToken;
exports.getBaseAuthRedirectUrl = getBaseAuthRedirectUrl;
exports.getOpenIdByCode = getOpenIdByCode;
exports.getTempMaterial = getTempMaterial;
exports.uploadTempMaterial = uploadTempMaterial;
exports.getMaterialList = getMaterialList;
exports.getMaterial = getMaterial;
exports.uploadMaterial = uploadMaterial;
exports.deleteMaterial = deleteMaterial;
exports.getMenu = getMenu;
exports.updateMenu = updateMenu;
exports.closeMenu = closeMenu;
exports.getOpenIdList = getOpenIdList;
exports.getCompleteOpenIdList = getCompleteOpenIdList;
exports.getSubscriberInfo = getSubscriberInfo;
exports.sendText = sendText;
exports.sendImage = sendImage;
exports.getTemplateList = getTemplateList;
exports.sendTemplateMessage = sendTemplateMessage;
exports.getTempQRCodeTicket = getTempQRCodeTicket;
exports.getQRCodeTicket = getQRCodeTicket;
exports.getQRCodeImage = getQRCodeImage;
exports.clearQuota = clearQuota;

function init(config) {
  appid  = String(config.appid);
  secret = String(config.secret);
  token  = String(config.token);
  AESKey = String(config.AESKey);
  timeoutMillis = config.timeoutMillis || 5000;
  console.log('[Wechat] Init ok');
}

function validateSignature(signature, timestamp, nonce) {
  let arr = [token, timestamp, nonce];
  arr = arr.sort((s1, s2) => (s1.localeCompare(s2)));
  let _signature = crypto.createHash('sha1').update(arr.join('')).digest('hex');

  debug('remote %s', signature);
  debug('local  %s', _signature);
  console.log('[Wechat] Signature validate ok');
  return (signature === _signature);
}

function updateAccessToken() {
  let options = {
    url: 'https://api.weixin.qq.com/cgi-bin/token',
    method: 'GET',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    qs: {
      grant_type: 'client_credential',
      appid, secret
    }
  };
  return new Promise((resolve, reject) => {
    _request(options).then((data) => {
      Cache.set(ACCESS_TOKEN_KEY, data.access_token).then(() => {
        console.log('[Wechat] Update Access Token: ' + data.access_token);
        resolve(data.access_token);
      }).catch(reject);
    }).catch(reject);
  })
}

function getBaseAuthRedirectUrl(url) {
  return 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=' + appid + '&redirect_uri=' + encodeURI(url) + '&response_type=code&scope=snsapi_base&state=123#wechat_redirect';
}

function getOpenIdByCode(code) {
  let options = {
    url: 'https://api.weixin.qq.com/sns/oauth2/access_token',
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    },
    qs: {
      appid: appid,
      secret: secret,
      code: code,
      grant_type: 'authorization_code'
    }
  };
  return new Promise((resolve, reject) => {
    _request(options).then((data) => {
      debug('Get openid of code, code: %s, openid: %s', code, data.openid);
      resolve(data.openid);
    }).catch(reject);
  });
}

function getTempMaterial(mediaId) {
  let options = {
    url: 'https://api.weixin.qq.com/cgi-bin/media/get',
    method: 'GET',
    qs: {
      access_token: true,
      media_id: mediaId
    }
  };
  return _request(options, true);
}

function uploadTempMaterial(type, filePath) {
  let options = {
    url: 'https://api.weixin.qq.com/cgi-bin/media/upload',
    method: 'POST',
    qs: {
      access_token: true
    },
    formData: {
      type,
      media: fs.createReadStream(filePath)
    }
  };
  return _request(options);
}

function getMaterialList(type, offset, count) {
  let options = {
    url: 'https://api.weixin.qq.com/cgi-bin/material/batchget_material',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    qs: {
      access_token: true
    },
    body: {
      type, offset, count
    }
  };
  return _request(options);
}

function getMaterial(mediaId) {
  let options = {
    url: 'https://api.weixin.qq.com/cgi-bin/material/get_material',
    method: 'POST',
    qs: {
      access_token: true
    },
    body: {
      media_id: mediaId
    }
  };
  return _request(options, true);
}

function uploadMaterial(type, filePath) {
  let options = {
    url: 'https://api.weixin.qq.com/cgi-bin/material/add_material',
    method: 'POST',
    qs: {
      access_token: true
    },
    formData: {
      type,
      media: fs.createReadStream(filePath)
    }
  };
  return _request(options);
}

function deleteMaterial(mediaId) {
  let options = {
    url: 'https://api.weixin.qq.com/cgi-bin/material/del_material',
    method: 'POST',
    qs: {
      access_token: true
    },
    body: {
      media_id: mediaId
    }
  };
  return _request(options);
}

function getMenu() {
  let options = {
    url: 'https://api.weixin.qq.com/cgi-bin/menu/get',
    method: 'GET',
    qs: {
      access_token: true
    }
  };
  return _request(options);
}

function updateMenu(menuConfig) {
  let options = {
    url: 'https://api.weixin.qq.com/cgi-bin/menu/create',
    method: 'POST',
    qs: {
      access_token: true
    },
    body: menuConfig
  };
  return _request(options);
}

function closeMenu() {
  let options = {
    url: 'https://api.weixin.qq.com/cgi-bin/menu/delete',
    method: 'GET',
    qs: {
      access_token: true
    }
  };
  return _request(options);
}

function getOpenIdList(nextOpenId) {
  let options = {
    url: 'https://api.weixin.qq.com/cgi-bin/user/get',
    method: 'GET',
    qs: {
      access_token: true,
      next_openid: nextOpenId
    }
  };
  return _request(options);
}

function getCompleteOpenIdList() {
  return getOpenIdList().then((data) => {
    if(!data.next_openid) {
        return [];
    }
    if(!data.data) {
        return [];
    }
    return getOpenIdList(data.next_openid).then(function(nextData) {
      return [].concat(data.data.openid, nextData.data ? nextData.data.openid : []);
    });
  });
}

function getSubscriberInfo(openId) {
  let options = {
    url: 'https://api.weixin.qq.com/cgi-bin/user/info',
    method: 'GET',
    qs: {
      access_token: true,
      openid: openId,
      lang: 'zh_CN'
    }
  };
  return _request(options);
}

function sendText(openId, content) {
  let options = {
    url: 'https://api.weixin.qq.com/cgi-bin/message/custom/send',
    method: 'POST',
    qs: {
      access_token: true
    }, 
    body: {
      touser: openId,
      msgtype: "text",
      text: {
        content: content
      }
    }
  };
  return _request(options);
}

function sendImage(openId, mediaId) {
  let options = {
    url: 'https://api.weixin.qq.com/cgi-bin/message/custom/send',
    method: 'POST',
    qs: {
      access_token: true
    }, 
    body: {
      touser: openId,
      msgtype: "image",
      image: {
        media_id: mediaId
      }
    }
  };
  return _request(options);
}

function getTemplateList() {
  let options = {
    url: 'https://api.weixin.qq.com/cgi-bin/template/get_all_private_template',
    method: 'GET',
    qs: {
      access_token: true
    }
  };
  return _request(options);
}

function sendTemplateMessage(openId, tplId, url, data) {
  let options = {
    url: 'https://api.weixin.qq.com/cgi-bin/message/template/send',
    method: 'POST',
    qs: {
      access_token: true
    },
    body: {
      "touser": openId,
      "template_id": tplId,
      "url": url,
      "data": data
    }
  };
  return _request(options);
}

function getTempQRCodeTicket(sceneId, expireSeconds) {
  let options = {
    url: 'https://api.weixin.qq.com/cgi-bin/qrcode/create',
    method: 'POST',
    qs: {
      access_token: true
    },
    body: {
      "expire_seconds": expireSeconds || 2592000,
      "action_name": "QR_SCENE",
      "action_info": {
        "scene": {
          "scene_id": sceneId
        }
      }
    }
  };
  return _request(options);
}

function getQRCodeTicket(sceneStr) {
  let options = {
    url: 'https://api.weixin.qq.com/cgi-bin/qrcode/create',
    method: 'POST',
    qs: {
      access_token: true
    },
    body: {
      "action_name": "QR_LIMIT_STR_SCENE", 
      "action_info": {
        "scene": {
          "scene_str": sceneStr
        }
      }
    }
  };
  return _request(options);
}

function getQRCodeImage(ticket) {
  let options = {
    url: 'https://mp.weixin.qq.com/cgi-bin/showqrcode',
    method: 'GET',
    qs: {
      ticket
    }
  };
  return _request(options, true);
}

function clearQuota() {
  let options = {
    url: 'https://api.weixin.qq.com/cgi-bin/clear_quota',
    method: 'POST',
    qs: {
      access_token: true
    },
    body: { appid }
  };
  return _request(options);
}

function _request(options, pure) {
  const EventEmitter = require('events').EventEmitter;
  let retryTime = 0;
  let event = new EventEmitter();

  return new Promise((resolve, reject) => {
    // 错误
    event.on('fail', (err, msg)=> {
      console.error(msg);
      console.error(err);
      reject(err);
    });
    // 成功
    event.on('finish', (data)=> {
      resolve(data);
    });
    // 超时
    event.on('timeout', (options)=> {
      retryTime++;
      if(retryTime > 0) {
        return event.emit('fail', new Error(`ETIMEDOUT`, `: Request to wechat service timeout, retry time: ${retryTime}`));
      } else {
        return event.emit('ready', options);
      }
    });
    // query设置
    event.on('prepare-query', ()=> {
      options.timeout = timeoutMillis;
      if (options.qs && options.qs.access_token) {
        Cache.get(ACCESS_TOKEN_KEY).then((tokenCache) => {
          if(tokenCache) {
            options.qs.access_token = tokenCache;
          }
          event.emit('prepare-body');
        }).catch((err) => {
          event.emit('fail', err, 'Get access token cache error.')
        });
      } else {
        event.emit('prepare-body');
      }
    });
    // body设置
    event.on('prepare-body', ()=> {
      if(options.method && options.method.toLowerCase() === 'post' && typeof(options.body) === 'object') {
        options.body = JSON.stringify(options.body);
      }
      event.emit('ready');
    });
    // 就绪
    event.on('ready', ()=> {
      if(pure) {
        return resolve(request(options));
      }
      request(options, function (error, response, body) {
        let dateStr = (new Date()).format('yyyy-MM-dd HH:mm:ss S')
        // debug(`[${dateStr}] [WechatRequest] \n -> [Options] ${JSON.stringify(options, null, 2)} \n -> [Error] ${JSON.stringify(error, null, 2)} \n -> [Body] ${(body)?JSON.stringify(JSON.parse(body), null, 2):'_EMPTY_'}`);

        if (error || (response.statusCode !== 200))
          if (error.message == 'ETIMEDOUT')
            return event.emit('timeout', options);
          else
            return event.emit('fail', error, `Received an error from wechat server, code: ${response && response.statusCode}`);
        try {
          (typeof body === 'string') && (body = JSON.parse(body));
          if (body.errcode && body.errcode !== 0) {
            if (body.errcode === 40001 || body.errcode === 40014 || body.errcode === 42001) {
              return event.emit('err-token');
            } else if (body.errcode === 45009) {
              return event.emit('fail', new Error(45009), `Wechat API [${options.url}] reach limit.`);
            } else {
              return event.emit('fail', new Error('Wechat error ' + body.errcode), `Request to wechat service error, body: ${JSON.stringify(body)}`);
            }
          } else {
            return event.emit('finish', body);
          }
        } catch (e) {
          return event.emit('fail', new Error('JSON Parse Error'), 'Body: ' + body);
        }
      });
    });
    event.on('err-token', ()=> {
      console.error('Access token error, try to refresh access_token. Old access_token %s. error: %s', options.qs.access_token);
      updateAccessToken().then((token) => {
        event.emit('prepare-query');
      }).catch((err) => {
        event.emit('fail', err, `Refresh access_token error.`);
      });
    });
    event.emit('prepare-query');
  });
}