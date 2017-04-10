'use strict';

(function(window, document, $, module, exports, require, swal, Qiniu, QiniuConfig){
  var Loader = require('component/common/loader');
  
  $('[name=addGroupBtn]').click(function() {
    $('body').append($('#create1-tpl').html());
    $('#create1').modal({backdrop: 'static', keyboard: false});

    $('#create1 #group-form').on('submit', function (e) {
      if (e.isDefaultPrevented()) {
      } else {
        e.preventDefault();
        var sceneStrs = [];
        var waitSeconds = $('#create1 [name=waitSeconds]').val() || 0;
        waitSeconds = parseInt(waitSeconds);
        Loader.show();
        $.ajax({
          url : '/api/admin/subscribeReply',
          type : 'POST',
          data : JSON.stringify({waitSeconds: waitSeconds}),
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
                $('#create1').modal('hide');
                location.reload();
              });
          }
        });
      }
    });
    $('#create1').on('hidden.bs.modal', function () {
      $('#create1').remove();
    });
  });

})(window, document, window['jQuery'], module, exports, require, window['swal'], window['Qiniu'], window['QiniuConfig']);