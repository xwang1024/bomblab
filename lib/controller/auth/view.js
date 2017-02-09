'use strict';

const RenderUtil = require('../render-util');

exports.signIn = function(req, res, next) {
  let renderUtil = new RenderUtil(req, res);
  if (req.isAuthenticated()) {
    res.redirect(getReturnUrl(req));
  } else {
    renderUtil.render({
      path: 'auth/signIn',
      subTitle: "登录",
      layout: 'single'
    });
  }
};

exports.signUp = function(req, res, next) {
  renderUtil.render({
    path: 'auth/signUp',
    subTitle: "注册",
    layout: 'single'
  });
};

exports.signOut = function(req, res, next) {
  req.logout();
  res.redirect('/auth/signIn');
};

function getReturnUrl(req) {
  var returnUrl = req.user.defaultReturnUrl();
  // if (req.session.returnUrl) {
  //   returnUrl = req.session.returnUrl;
  //   delete req.session.returnUrl;
  // }
  return returnUrl;
};