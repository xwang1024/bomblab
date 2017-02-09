'use strict';

module.exports = exports = function(req, res) {
  return {
    render: function(path, title, data, layout, noAuth) {
      var context = {
        _POINT_: req.app.config.point,
        _TITLE_: title,
        _PATH_: req.path,
        _PARAMS_: req.params,
        _QUERY_: req.query,
        _DATA_: data
      };
      layout && (context.layout = layout);
      req.mobileUser && (context._MOBILE_USER_ = req.mobileUser);
      req.user && (context._USER_ = req.user.getVO());
      req.jsSdkSign && (context._SIGN_ = req.jsSdkSign);
      noAuth && (context._NO_AUTH_ = true);
      res.render(path, context);
    }
  }
};
