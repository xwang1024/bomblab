'use strict';

module.exports = exports = function (app, mongoose) {
  var templateSendLog = new mongoose.Schema({
    templateMessage: { type: mongoose.Schema.Types.ObjectId, ref: "TemplateMessage" },
    subscriber: { type: mongoose.Schema.Types.ObjectId, ref: "Subscriber" },
    status: { type: String },
    createdAt: { type: Date, default: Date.now }
  });
  app.db.model('TemplateSendLog', templateSendLog);
};