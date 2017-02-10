'use strict';

module.exports = exports = function (app, mongoose) {
  var activitySchema = new mongoose.Schema({
    name: {type: String, index: true},
    asset: { type: mongoose.Schema.Types.ObjectId, ref: "Asset" },
    createdAt: {type: Date, default: Date.now}
  });
  app.db.model('Activity', activitySchema);
};