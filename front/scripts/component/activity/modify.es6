'use strict';

(function(window, document, $, module, exports, require, swal, Qiniu, QiniuConfig){
  var Loader = require('component/common/loader');
  
  $('[name=modifyActivityBtn]').click(function() {
    var _id = $(this).parents('tr').data('id')
    var name = $(this).parents('tr').data('name')
    var hint = $(this).parents('tr').data('hint')
    console.log(_id, name, hint, mediaId)

    $('body').append($('#modify-tpl').html());
    $('#modify').modal({backdrop: 'static', keyboard: false});

    $('#modify [name="name"]').val(name);
    $('#modify [name="hint"]').val(hint);

    $('#modify #activity-form').on('submit', function (e) {
      if (e.isDefaultPrevented()) {
      } else {
        e.preventDefault();
        var sceneStrs = [];
        var name = $('#modify [name=name]').val();
        var hint = $('#modify [name=hint]').val();
        Loader.show();
        $.ajax({
          url : '/api/admin/activity/' + _id,
          type : 'PUT',
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
                title : "活动修改成功",
                type : "success"
              },
              function () {
                $('#modify').modal('hide');
                location.reload();
              });
          }
        });
      }
    });
    $('#modify').on('hidden.bs.modal', function () {
      $('#modify').remove();
    });
  });

})(window, document, window['jQuery'], module, exports, require, window['swal'], window['Qiniu'], window['QiniuConfig']);