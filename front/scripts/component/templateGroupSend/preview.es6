'use strict';

(function(window, document, $, module, exports, require, swal, Qiniu, QiniuConfig){
  let Loader = require('component/common/loader');

  $('[name=messagePreviewBtn]').click(function() {
    let _id = $(this).parents('tr').data('id');
    Loader.show();
    $.ajax({
      url : '/api/admin/templateGroupSend/' + _id,
      type : 'GET',
      dataType: 'json',
      contentType: 'application/json',
      success : (resData) => {
        Loader.hide();
        $('body').append($('#preview-message-tpl').html());
        $('#preview-message').modal({backdrop: 'static', keyboard: false});

        $('#preview-message').find('[name=url]').val(resData.url);
        $('#preview-message').find('pre').html(resData.previewHtml);
        
        $('#preview-message').on('hidden.bs.modal', function () {
          $('#preview-message').remove();
        });
      }
    });
  });
})(window, document, window['jQuery'], module, exports, require, window['swal'], window['Qiniu'], window['QiniuConfig']);