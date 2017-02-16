'use strict';

(function(window, document, $, module, exports, require, swal, Qiniu, QiniuConfig){
  let Loader = require('component/common/loader');
  let MessageQueue = require('component/replyQueue/message_queue');
  let messageQueue = new MessageQueue('#detail-area');
  
  $('[name=queueDetailBtn]').click(function() {
    let id = $(this).parents('tr').data('id');
    Loader.show();
    $.ajax({
      url : '/api/admin/replyQueue/' + id,
      type : 'GET',
      dataType: 'json',
      contentType: 'application/json',
      success : (data) => {
        Loader.hide();
        $(this).parents('tr').addClass('bg-gray').siblings().removeClass('bg-gray');
        $('#list-area').removeClass('col-md-12').addClass('col-md-7');
        messageQueue.init(data);
        $('#detail-area').removeClass('hidden');
      }
    });
  });

})(window, document, window['jQuery'], module, exports, require, window['swal'], window['Qiniu'], window['QiniuConfig']);