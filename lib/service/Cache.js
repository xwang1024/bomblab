'use strict';

const redis = require("redis");

let redisClient = null;
let prefix      = '';

exports.init = function(config) {
  if(redisClient) return;
  // 前缀设置
  if(config.prefix) {
    prefix = String(config.prefix);
    delete config.prefix;
  }
  // 创建client
  redisClient = redis.createClient(config);
  redisClient.on("ready", function(err) {
    console.log('[Cache] Connect ok');
  });
  redisClient.on("error", function(err) {
    console.error('[Cache] Error connecting: ' + err);
  });
}

exports.set = function setCache(k, v) {
  if(!k) throw new Error('[Cache:set] k is undefined');
  return new Promise((resolve, reject) => {
    let data = { value: v };
    redisClient.set(prefix + k, JSON.stringify(data), (err) => {
      if(err) return reject(err);
      return resolve(v);
    });
  });
}

exports.setex = function setCache(k, exSeconds, v) {
  if(!k) throw new Error('[Cache:set] k is undefined');
  return new Promise((resolve, reject) => {
    let data = { value: v };
    redisClient.setex(prefix + k, exSeconds, JSON.stringify(data), (err) => {
      if(err) return reject(err);
      return resolve(v);
    });
  });
}

exports.get = function getCache(k) {
  if(!k) throw new Error('[Cache:get] k is undefined');
  return new Promise((resolve, reject) => {
    redisClient.get(prefix + k, (err, reply) => {
      if(err) return reject(err);
      let data = JSON.parse(reply);
      resolve(data ? data.value : undefined);
    });
  });
}

exports.del = function delCache(k) {
  if(!k) throw new Error('[Cache:del] k is undefined');
  return new Promise((resolve, reject) => {
    redisClient.del(prefix + k, (err) => {
      if(err) return reject(err);
      resolve();
    });
  });
}