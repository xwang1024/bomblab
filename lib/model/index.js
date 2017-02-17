'use strict';

module.exports = exports = function (app, mongoose) {
  
  require('./schema/asset')(app, mongoose);
  require('./schema/activity')(app, mongoose);
  require('./schema/activityLog')(app, mongoose);
  require('./schema/replyQueue')(app, mongoose);
  require('./schema/replyQueueLog')(app, mongoose);
  require('./schema/subscriber')(app, mongoose);
  
  // 登录注册用户权限相关schema
  require('./schema/user')(app, mongoose);
  require('./schema/loginAttempt')(app, mongoose);

}