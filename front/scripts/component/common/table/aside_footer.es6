'use strict';

(function(window, document, $, module, exports, require){
  var $table = $('table.table-aside-footer');
  var $tbody = $('table.table-aside-footer>tbody');
  var $tfoot = $('table.table-aside-footer>tfoot');

  function processAside($window) {
    if($window.scrollTop() + $window.height() > $tbody.offset().top + $tbody.height() + $tfoot.height()) {
      $tfoot.removeClass('aside-tfoot');
      $table.removeAttr('style');
    } else {
      if($table.hasClass('drawer-table')) {
        $tfoot.find('tr').css({"width": $tbody.find('tr').outerWidth() + "px"});
      } else {
        $tfoot.find('tr').css({"width": ($tbody.find('tr').outerWidth()) + "px"});
      }

      if(!$tfoot.hasClass('aside-tfoot')) {
        $tfoot.addClass('aside-tfoot');
        $table.css({"margin-bottom": parseInt($tfoot.height()) + 'px'})
      }
    }
  }
  if($tfoot.length === 0) return;
  $(window).on('scroll resize', function() {
    processAside($(this));
  });
  processAside($(window));
})(window, document, window['jQuery'], module, exports, require);