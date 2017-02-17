'use strict';

(function(window, document, $, module, exports, require, swal, Qiniu, QiniuConfig){
  var Loader = require('component/common/loader');

  $('[name=deleteImageBtn]').click(function(e) {
    var id = $(this).parents('tr').data('id');
    swal({
      title : '确定删除图片？',
      text : '微信素材库中将同步删除该素材',
      type : "warning",
      showCancelButton : true,
      confirmButtonText : "确定删除",
      cancelButtonText : "取消",
      closeOnConfirm : false
    }, function (isConfirm) {
      if (isConfirm) {
        Loader.show();
        $.ajax({
          url: '/api/admin/material/'+id,
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
                text : "该图片已删除",
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