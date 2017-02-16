'use strict';

const mongoose = require('mongoose');

let mongoClient = null;

exports.init = function(config) {
  if(mongoClient) return;
  mongoose.Promise = global.Promise;
  mongoClient = mongoose.createConnection(config.uri);
  mongoClient.once("open", function(err) {
    console.log('[Mongo] Connect ok');
  });
  mongoClient.on("error", function(err) {
    console.error('[Mongo] Error connecting: ' + err);
  });
}
