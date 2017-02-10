'use strict';

(function(window, document, $, module, exports, require, swal, Qiniu, QiniuConfig){
  let imgPreview = require('component/common/img_preview');
  let activityId = $('[name=activityId]').val();
  $('[name=previewImageBtn]').click(function(e) {
    let url = $(this).data('url');
    imgPreview(url);
  });
})(window, document, window['jQuery'], module, exports, require, window['swal'], window['Qiniu'], window['QiniuConfig']);