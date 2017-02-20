'use strict';

module.exports = exports = function (app, mongoose) {
  var templateMessage = new mongoose.Schema({
    name: { type: String },
    data: {  },
    createdAt: { type: Date, default: Date.now }
  });
  app.db.model('TemplateMessage', templateMessage);
};