'use strict';

(function(window, document, $, module, exports, require, swal, Qiniu, QiniuConfig){
  let Loader = require('component/common/loader');
  let MessageQueue = require('component/replyQueue/message_queue');
  let messageQueue = new MessageQueue('#detail-area');
  
  $('[name=syncBtn]').click(function() {
    Loader.show();
    $.ajax({
      url : '/api/admin/subscriber/sync',
      type : 'POST',
      dataType: 'json',
      contentType: 'application/json',
      success : (data) => {
        Loader.hide();
        if(data.error) {
          if(typeof data.error.message === 'object') {
            data.error.message = data.error.message.join('\n');
          }
          return swal('错误', data.error.message, 'error');
        } else {
          swal({
            title : "成功",
            text : "同步成功",
            type : "success"
          },
          function () {
            location.reload();
          });
        }
      }
    });
  });

})(window, document, window['jQuery'], module, exports, require, window['swal'], window['Qiniu'], window['QiniuConfig']);