'use strict';

(function(window, document, $, module, exports, require, swal, Qiniu, QiniuConfig){
  var Loader = require('component/common/loader');

  $('[name=deleteReplyBtn]').click(function(e) {
    var id = $(this).parents('.panel').data('id');
    swal({
      title : '确定删除该回复？',
      text : '回复中的消息将被删除且该操作不可逆',
      type : "warning",
      showCancelButton : true,
      confirmButtonText : "确定删除",
      cancelButtonText : "取消",
      closeOnConfirm : false
    }, function (isConfirm) {
      if (isConfirm) {
        Loader.show();
        $.ajax({
          url: '/api/admin/subscribeReply/'+id,
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
                text : "该回复已删除",
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