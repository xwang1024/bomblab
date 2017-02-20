'use strict';

(function(window, document, $, module, exports, require, swal, Qiniu, QiniuConfig){
  var Loader = require('component/common/loader');
  
  $('[name=addGroupBtn]').click(function() {
    $('body').append($('#create-group-tpl').html());
    $('#create-group').modal({backdrop: 'static', keyboard: false});

    $('#create-group #group-form').on('submit', function (e) {
      if (e.isDefaultPrevented()) {
      } else {
        e.preventDefault();
        var sceneStrs = [];
        var name = $('#create-group [name=name]').val();
        Loader.show();
        $.ajax({
          url : '/api/admin/customGroupSend',
          type : 'POST',
          data : JSON.stringify({name: name}),
          dataType: 'json',
          contentType: 'application/json',
          success : function(data) {
            Loader.hide();
            console.log(data);
            if (data.error) {
              if (typeof data.error.message === 'object') {
                data.error.message = data.error.message.join('\n');
              }
              return swal('错误', data.error.message, 'error');
            }
            swal({
                title: "客服消息创建成功",
                text: "请修改内容后进行发送",
                type: "success"
              },
              function () {
                $('#create-group').modal('hide');
                location.reload();
              });
          }
        });
      }
    });
    $('#create-group').on('hidden.bs.modal', function () {
      $('#create-group').remove();
    });
  });

})(window, document, window['jQuery'], module, exports, require, window['swal'], window['Qiniu'], window['QiniuConfig']);