'use strict';

(function(window, document, $, module, exports, require, swal, Qiniu, QiniuConfig){
  var Loader = require('component/common/loader');

  $('[name=groupSendBtn]').click(function(e) {
    var id = $(this).parents('tr').data('id');
    swal({
      title : '确定群发客服消息？',
      text : '群发过程不可中断，请确保群发的内容无误！',
      type : "warning",
      showCancelButton : true,
      confirmButtonText : "确定群发",
      cancelButtonText : "取消",
      closeOnConfirm : false
    }, function (isConfirm) {
      if (isConfirm) {
        Loader.show();
        $.ajax({
          url: '/api/admin/customGroupSend/'+id+'/send',
          type: 'POST',
          dataType: 'json',
          contentType: 'application/json',
          success: function (data) {
            Loader.hide();
            if(data.error) {
              if(typeof data.error.message === 'object') {
                data.error.message = data.error.message.join('\n');
              }
              return swal('错误', data.error.message, 'error');
            } else {
              swal({
                title : "成功",
                text : "该消息已群发",
                type : "success"
              },
              function () {
                location.reload();
              });
            }
          }
        });
      }
    });
  });

})(window, document, window['jQuery'], module, exports, require, window['swal'], window['Qiniu'], window['QiniuConfig']);