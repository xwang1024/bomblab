'use strict';

module.exports = exports = function (app, mongoose) {
  var templateMessage = new mongoose.Schema({
    name: { type: String },
    templateId: { type: String },
    url:  { type: String },
    data: {  },
    previewHtml: { type: String },
    createdAt: { type: Date, default: Date.now }
  });
  app.db.model('TemplateMessage', templateMessage);
};