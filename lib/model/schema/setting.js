'use strict';

module.exports = exports = function (app, mongoose) {
  var setting = new mongoose.Schema({
    key: { type: String },
    value: { },
    updatedAt: { type: Date, default: Date.now }
  });
  app.db.model('Setting', setting);
};