'use strict';

(function(window, document, $, module, exports, require, swal, Qiniu, QiniuConfig){
  var Loader = require('component/common/loader');
  
  $('[name=addGroupBtn]').click(function() {
    $('body').append($('#create-tpl').html());
    $('#create').modal({backdrop: 'static', keyboard: false});

    $('#create #group-form').on('submit', function (e) {
      if (e.isDefaultPrevented()) {
      } else {
        e.preventDefault();
        var sceneStrs = [];
        var waitMinutes = $('#create [name=waitMinutes]').val() || 0;
        waitMinutes = parseInt(waitMinutes);
        Loader.show();
        $.ajax({
          url : '/api/admin/subscribeReply',
          type : 'POST',
          data : JSON.stringify({waitMinutes: waitMinutes}),
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
                title : "消息组添加成功",
                type : "success"
              },
              function () {
                $('#create').modal('hide');
                location.reload();
              });
          }
        });
      }
    });
    $('#create').on('hidden.bs.modal', function () {
      $('#create').remove();
    });
  });

})(window, document, window['jQuery'], module, exports, require, window['swal'], window['Qiniu'], window['QiniuConfig']);