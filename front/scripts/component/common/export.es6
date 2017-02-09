'use strict';

(function(window, document, $, module, exports, require){
  var Query = require('component/common/query');
  var query = new Query();

  $('[data-export-type]').unbind().click(function() {
    var type = $(this).data('exportType');
    query.remove('page')
         .remove('pageSize')
         .set('noPagination', true)
         .set('export', true);
    window.location.search = query.toString();
  });
})(window, document, window['jQuery'], module, exports, require);