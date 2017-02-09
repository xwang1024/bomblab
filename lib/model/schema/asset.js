'use strict';

var path = require('path');

module.exports = exports = function (app, mongoose) {
  var assetSchema = new mongoose.Schema({
    name: { type: String },
    ext: { type: String },
    key: { type: String, index: true },
    mediaId: { type: String, index: true },
    activity: { type: mongoose.Schema.Types.ObjectId, ref: "Activity" },
  });
  
  app.db.model('Asset', assetSchema);
};