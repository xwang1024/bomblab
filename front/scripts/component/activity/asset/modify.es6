'use strict';

(function(window, document, $, module, exports, require, swal, Qiniu, QiniuConfig){
  let Loader = require('component/common/loader');
  let activityId = $('[name=activityId]').val();
  $('[name=modifyImageBtn]').click(function(e) {
    $('body').append($('#image-modify-tpl').html());
    let id = $(this).parents('tr').data('id');
    let name = $(this).parents('tr').find('[name=name]').text();
    $('#image-modify [name=name]').val(name);

    // 绑定修改操作
    $('#image-modify [name=submitModifyBtn]').unbind().click(function() {
      let body = {
        name: $('#image-modify [name=name]').val()
      }
      console.log(body)
      $.ajax({
        url: '/api/admin/asset/'+id,
        type: 'PUT',
        data: JSON.stringify(body),
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
                text : "图片已修改",
                type : "success"
              },
              function () {
                location.reload();
              });
          }
        }
      });
    });
    $('#image-modify').modal({backdrop: 'static', keyboard: false});
  });
})(window, document, window['jQuery'], module, exports, require, window['swal'], window['Qiniu'], window['QiniuConfig']);