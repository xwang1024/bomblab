'use strict';

let Mongo = require('./Mongo');
let DB = Mongo.getClient();

exports.sendCard = function(openId) {
  console.log('sendCard');
}