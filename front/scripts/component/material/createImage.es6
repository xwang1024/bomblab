'use strict';

(function(window, document, $, module, exports, require, swal, Qiniu, QiniuConfig){
  let Loader = require('component/common/loader');
  
  $('[name=addImageBtn]').click(function() {
    $('body').append($('#create-tpl').html());
    $('#create').modal({backdrop: 'static', keyboard: false});
    $('[name=submitBtn]').prop('disabled', true);

    $('input[type=file]').on("change", function (e) {
      let file = e.currentTarget.files[0];
      if(file) {
        if(file.size > 2000000) {
          alert('图片文件大小不得超过2M');
          $('[name=submitBtn]').prop('disabled', true);
        } else {
          console.log(file);
          $('[name=submitBtn]').prop('disabled', false);
          $('[name=uploadFilePath]').text(file.name);
        }
      }
    });

    $('#image-upload-btn').unbind().on('click', function(e) {
      $('input[type=file]').trigger('click');
    })

    $('#create #image-form').on('submit', function (e) {
      if (e.isDefaultPrevented()) {
      } else {
        e.preventDefault();
        let data = new FormData();
        data.append('type', 'image');
        data.append('file', $('input[type=file]')[0].files[0]);
        Loader.show();
        $.ajax({
          url : '/api/admin/material',
          type : 'POST',
          data : data,
          cache: false,
          contentType: false,
          processData: false,
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
                title : "图片上传成功",
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