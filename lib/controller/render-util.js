'use strict';

module.exports = exports = function(req, res) {
  return {
    render: function(renderConfig) {
      var context = {
        _TITLE_: renderConfig.title,
        _SUB_TITLE_: renderConfig.subYitle,
        _PATH_: req.path,
        _PARAMS_: req.params,
        _QUERY_: req.query,
        _DATA_: renderConfig.data || {}
      };
      renderConfig.layout && (context.layout = renderConfig.layout);
      req.user && (context._USER_ = req.user.getVO());
      req.jsSdkSign && (context._SIGN_ = req.jsSdkSign);
      res.render(renderConfig.path, context);
    }
  }
};
