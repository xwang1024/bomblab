'use strict';

(function(window, document, $, module, exports, require, swal, Qiniu, QiniuConfig){
  var Loader = require('component/common/loader');
  
  $('[name=addQueueBtn]').click(function() {
    $('body').append($('#create1-tpl').html());
    $('#create1').modal({backdrop: 'static', keyboard: false});

    $('#create1 #queue-form').on('submit', function (e) {
      if (e.isDefaultPrevented()) {
      } else {
        e.preventDefault();
        var sceneStrs = [];
        var name = $('#create1 [name=name]').val();
        Loader.show();
        $.ajax({
          url : '/api/admin/replyQueue',
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
                title : "队列添加成功",
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
    $('#create1').on('hidden.bs.modal', function () {
      $('#create1').remove();
    });
  });

})(window, document, window['jQuery'], module, exports, require, window['swal'], window['Qiniu'], window['QiniuConfig']);