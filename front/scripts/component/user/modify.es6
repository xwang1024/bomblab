'use strict';

(function(window, document, $, module, exports, require, swal, Qiniu, QiniuConfig){
  let Loader = require('component/common/loader');
  
  $('[name=modifyBtn]').click(function(e) {
    $('body').append($('#modify-tpl').html());
    let id = $(this).parents('tr').data('id');
    let username = $(this).parents('tr').find('[data-username]').data('username');
    $('#modify [name=username]').val(username);
    let role = $(this).parents('tr').find('[data-role]').data('role');
    $('#modify [name=role]').val(role);
    let isActive = $(this).parents('tr').find('[data-is-active]').data('isActive');
    $('#modify [name=isActive]').val(isActive);

    // 绑定修改操作
    $('#modify #account-form').on('submit', function (e) {
      if (e.isDefaultPrevented()) {
      } else {
        e.preventDefault();
        let data = $(this).serializeArray().reduce(function(obj, item) {
          obj[item.name] = item.value;
          return obj;
        }, {});
        if(data.password) {
          if(!confirm("确定要重置密码？")) {
            return;
          }
        }

        Loader.show();
        $.ajax({
          url: '/api/root/user/' + id,
          type: 'PUT',
          data: JSON.stringify(data),
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
                  text : "账号修改成功",
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
    $('#modify').modal({backdrop: 'static', keyboard: false});
  });

})(window, document, window['jQuery'], module, exports, require, window['swal'], window['Qiniu'], window['QiniuConfig']);