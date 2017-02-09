'use strict';

module.exports = exports = function (app, mongoose) {
  var activityLogSchema = new mongoose.Schema({
    openId: {type: String, index: true},
    activity: {type: mongoose.Schema.Types.ObjectId, ref: "Activity"},
    asset: { type: mongoose.Schema.Types.ObjectId, ref: "Asset" },
    createdAt: {type: Date, default: Date.now}
  });
  app.db.model('ActivityLog', activityLogSchema);
};