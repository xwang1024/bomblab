'use strict';

(function(window, document, $, module, exports, require, swal, Qiniu, QiniuConfig){
  var Loader = require('component/common/loader');
  var activityId = $('[name=activityId]').val();
  $('[name=deleteImageBtn]').click(function(e) {
    var id = $(this).parents('.media-box').data('id');
    swal({
      title : '确定删除？',
      text : '已获取该图片的用户仍可通过回复获得该图片',
      type : "warning",
      showCancelButton : true,
      confirmButtonText : "确定删除",
      cancelButtonText : "取消",
      closeOnConfirm : false
    }, function (isConfirm) {
      if (isConfirm) {
        $.ajax({
          url: '/api/admin/asset/'+id,
          type: 'DELETE',
          dataType: 'json',
          contentType: 'application/json',
          success: function (data) {
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