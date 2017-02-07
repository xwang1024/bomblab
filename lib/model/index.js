'use strict';

module.exports = exports = function (app, mongoose) {

  // require('./schema/test')(app, mongoose);
  // require('./schema/scale')(app, mongoose);
  // require('./schema/scale-answer')(app, mongoose);
  // require('./schema/article')(app, mongoose);
  // require('./schema/media')(app, mongoose);
  // require('./schema/question')(app, mongoose);
  // require('./schema/question-answer')(app, mongoose);
  // require('./schema/media-usage')(app, mongoose);
  // require('./schema/subscriber')(app, mongoose);
  // require('./schema/push-record')(app, mongoose);
  // require('./schema/dashboard-cache')(app, mongoose);
  // require('./schema/wechat-event')(app, mongoose);
  // require('./schema/article-comment')(app, mongoose);
  // require('./schema/point-record')(app, mongoose);
  // require('./schema/article-comment-thumbs-up-record')(app, mongoose);
  // require('./schema/hospital')(app, mongoose);
  // require('./schema/article-record')(app, mongoose);
  // require('./schema/recommendation')(app, mongoose);
  // require('./schema/recommendation-record')(app, mongoose);
  // require('./schema/code-openid-cache')(app, mongoose);
  // require('./schema/leave-message-record')(app, mongoose);
  // require('./schema/token-cache')(app, mongoose);
  // require('./schema/sms-code-cache')(app, mongoose);
  // require('./schema/sms-record')(app, mongoose);
  // require('./schema/game-record')(app, mongoose);
  // require('./schema/qr-code')(app, mongoose);
  // require('./schema/statistics-daily')(app, mongoose);
  // require('./schema/announcement')(app, mongoose);

  // 登录注册用户权限相关schema
  require('./schema/user')(app, mongoose);
  require('./schema/loginAttempt')(app, mongoose);

}