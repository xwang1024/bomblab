'use strict';

const request = require('request');

let config = null;

exports.init = init;
exports.uploadImage = uploadImage;

function init(_config) {
  config = _config;
}

function uploadImage(resourceUrl) {
  return new Promise((resolve, reject) => {
    _login().then((cookie) => {
      request({  
        url: 'http://wx.xiumi.us/resource/postresource?user_sid=' + config.sid + '&oriimg=false',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/54.0.2840.99 Safari/537.36',
          'Cookie': cookie
        },
        json: {
          "appid": config.appid,
          "resource": resourceUrl,
          "type": "image"
        }
      }, function (err, res, body) {
        if(err || !body) {
          reject(new Error('图片素材同步失败'));
          return console.log('图片素材同步失败');
        }
        let resultJson = body;
        if(!resultJson.media_id) {
          reject(resultJson);
          return console.log('media_id获取失败');
        }
        return resolve(resultJson.media_id);
      });
    }).catch(reject);
  });
}

function _login() {
  return new Promise((resolve, reject) => {
    // 发送登录请求
    let cookie = null;
    request({  
      url: 'http://xiumi.us/auth/email/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/54.0.2840.99 Safari/537.36'
      },  
      form: {
        email: config.email,
        password: config.password
      }  
    }, function (err, res, body) {
      if(err) {
        reject(new Error('用户名或密码错误'));
        return console.log('用户名或密码错误')
      }
      cookie = res.headers['set-cookie'];
      // 获取access_code
      request({  
        url: 'http://xiumi.us/auth/connect/user/access_code',
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/54.0.2840.99 Safari/537.36',
          'Cookie': cookie
        },
      }, function (err, res, body) {
        if(err || !body) {
          reject(new Error('access_code获取失败'));
          return console.log('access_code获取失败')
        }
        cookie = res.headers['set-cookie'];
        let json = JSON.parse(body);
        let accessCode = json.data;
        // 编辑器登录
        request({  
          url: 'http://wx.xiumi.us/user/login?access_code=' + accessCode,
          method: 'GET',
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/54.0.2840.99 Safari/537.36',
            'Cookie': cookie
          }
        }, function (err, res, body) {
          if(err || !body) {
            reject(new Error('编辑器登录失败'));
            return console.log('编辑器登录失败')
          }
          cookie = res.headers['set-cookie'];
          resolve(cookie);
        });
      });
    });
  });
}