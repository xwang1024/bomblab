'use strict';

(function(window, document, $, module, exports, require, swal, Qiniu, QiniuConfig){
  let Loader = require('component/common/loader');

  $('#invitation-switch').on('change', function() {
    var status = $(this).prop('checked');
    $.ajax({
      url : '/api/admin/setting/invitedCardStatus',
      type : 'PUT',
      data : status,
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
          title : "配置保存成功",
          type : "success"
        });
      }
    });
  })
        
        

  

})(window, document, window['jQuery'], module, exports, require, window['swal'], window['Qiniu'], window['QiniuConfig']);