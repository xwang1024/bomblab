'use strict';

(function(window, document, $, module, exports, require, swal, Qiniu, QiniuConfig){
  var Loader = require('component/common/loader');
  var activityId = $('[name=activityId]').val();
  $('[name=activeImageBtn]').click(function(e) {
    var id = $(this).parents('.media-box').data('id');
    swal({
      title : '确定激活该图片？',
      text : '用户回复活动暗号将永久获得该图片',
      type : "warning",
      showCancelButton : true,
      confirmButtonText : "确定激活",
      cancelButtonText : "取消",
      closeOnConfirm : false
    }, function (isConfirm) {
      if (isConfirm) {
        $.ajax({
          url: '/api/admin/activity/'+activityId,
          type: 'PUT',
          dataType: 'json',
          contentType: 'application/json',
          data: JSON.stringify({
            asset: id
          }),
          success: function (data) {
            if(data.error) {
              if(typeof data.error.message === 'object') {
                data.error.message = data.error.message.join('\n');
              }
              return swal('错误', data.error.message, 'error');
            } else {
              swal({
                  title : "成功",
                  text : "该图片已激活",
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