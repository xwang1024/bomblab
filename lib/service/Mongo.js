'use strict';

const mongoose      = require('mongoose');
const autoIncrement = require('mongoose-auto-increment');

let mongoClient = null;

mongoose.Promise = global.Promise;

exports.getClient = function(config) {
  return new Promise((resolve, reject) => {
    if(mongoClient) return resolve(mongoClient);
    let _mongoClient = mongoose.createConnection(config.uri);
    autoIncrement.initialize(_mongoClient);
    _mongoClient.once("open", function(err) {
      console.log('[Mongo] Connect ok');
      mongoClient = _mongoClient;
      _mongoClient = null;
      exports.getClient = function() { return mongoClient }
      return resolve(mongoClient);
    });
    _mongoClient.on("error", function(err) {
      console.error('[Mongo] Error connecting: ' + err);
    });
  });
}