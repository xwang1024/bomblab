'use strict';

(function(window, document, $, module, exports, require, swal, Qiniu, QiniuConfig){
  var Loader = require('component/common/loader');

  $('[name=deleteQueueBtn]').click(function(e) {
    var id = $(this).parents('tr').data('id');
    swal({
      title : '确定删除该回复队列？',
      text : '回复队列中的消息将被删除且该操作不可逆',
      type : "warning",
      showCancelButton : true,
      confirmButtonText : "确定删除",
      cancelButtonText : "取消",
      closeOnConfirm : false
    }, function (isConfirm) {
      if (isConfirm) {
        Loader.show();
        $.ajax({
          url: '/api/admin/replyQueue/'+id,
          type: 'DELETE',
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
                text : "该回复队列已删除",
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