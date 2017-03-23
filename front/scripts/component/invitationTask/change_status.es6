'use strict';

(function(window, document, $, module, exports, require, swal, Qiniu, QiniuConfig){
  var Loader = require('component/common/loader');

  $('[name=openBtn]').click(function(e) {
    var id = $(this).parents('tr').data('id');
    swal({
      title : '确定开启该邀请活动？',
      type : "warning",
      showCancelButton : true,
      confirmButtonText : "确定开启",
      cancelButtonText : "取消",
      closeOnConfirm : false
    }, function (isConfirm) {
      if (isConfirm) {
        Loader.show();
        $.ajax({
          url: '/api/admin/invitationTask/'+id,
          type: 'PUT',
          dataType: 'json',
          contentType: 'application/json',
          data: JSON.stringify({ status: 'OPEN' }),
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
                text : "该活动已开启",
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

  $('[name=closeBtn]').click(function(e) {
    var id = $(this).parents('tr').data('id');
    swal({
      title : '确定关闭该邀请活动？',
      type : "warning",
      showCancelButton : true,
      confirmButtonText : "确定关闭",
      cancelButtonText : "取消",
      closeOnConfirm : false
    }, function (isConfirm) {
      if (isConfirm) {
        Loader.show();
        $.ajax({
          url: '/api/admin/invitationTask/'+id,
          type: 'PUT',
          dataType: 'json',
          contentType: 'application/json',
          data: JSON.stringify({ status: 'CLOSE' }),
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
                text : "该活动已关闭",
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