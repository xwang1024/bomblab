'use strict';

(function(window, document, $, module, exports, require){
  function init() {
    let $modal = $(".img-preview-modal");
    $(".img-preview-modal").unbind().click(function() {
      $(".img-preview-modal").addClass('hidden');
    });
    $('[name=previewImageBtn]').unbind().click(function(e) {
      let url = $(this).data('url');
      $modal.find('img').attr('src', url);
      $modal.removeClass('hidden');
    });
  };
  init();
  module.exports = init;
})(window, document, window['jQuery'], module, exports, require);