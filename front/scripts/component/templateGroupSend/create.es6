'use strict';

(function(window, document, $, module, exports, require, swal, Qiniu, QiniuConfig){
  let Loader = require('component/common/loader');
  let regex = /\{\{([^\}]*)\.DATA\}\}/g;
  let templateList = [];
  let templateMap = {};
  
  $('[name=addMessageBtn]').click(function() {
    $('body').append($('#create-message-tpl').html());
    $('#create-message').modal({backdrop: 'static', keyboard: false});

    $.ajax({
      url : '/api/admin/messageTemplate',
      type : 'GET',
      dataType: 'json',
      contentType: 'application/json',
      success : function(resData) {
        templateList = resData.template_list;

        // render select
        $('#create-message').find('[name=templateId]').html(`
          <option value="null" selected disabled>请选择模板...</option>
          ${templateList.map((template) => {
            templateMap[template.template_id] = template;
            return `<option value="${template.template_id}">${template.title}</option>`;
          }).join('')}
        `).selectric().on('change', function() {
          let templateId = $(this).val();
          let currentTemplate = templateMap[templateId];
          function getParams(content) {
            let result;
            let params = [];
            while (result = regex.exec(content)) {
              params.push(result[1]);
            }
            return params;
          }
          let params = getParams(currentTemplate.content);
          $('#create-message').find('#params-area').html(`
            ${params.map((param) => {
              return `
                <div class="form-group">
                  <label>@${param}</label>
                  <input type="text" name='${param}' placeholder="${param}" class="form-control param-input" required autocomplete="off" value="{{${param}.DATA}}">
                </div>
              `;
            }).join('')}
          `);
          $('#create-message').find('#preview-area pre').html(currentTemplate.content);
          $('.param-input').on('blur keyup propertychange', function () {
            let templateData = {};
            let previewContent = currentTemplate.content;
            $('.param-input').each(function() {
              let k = $(this).attr('name');
              let v = $(this).val();
              previewContent = previewContent.replace(`{{${k}.DATA}}`, v);
            });
            $('#create-message').find('#preview-area pre').html(previewContent);
          });
        });
      }
    })

    // $('#create-group #group-form').on('submit', function (e) {
    //   if (e.isDefaultPrevented()) {
    //   } else {
    //     e.preventDefault();
    //     var sceneStrs = [];
    //     var name = $('#create-group [name=name]').val();
    //     Loader.show();
    //     $.ajax({
    //       url : '/api/admin/customGroupSend',
    //       type : 'POST',
    //       data : JSON.stringify({name: name}),
    //       dataType: 'json',
    //       contentType: 'application/json',
    //       success : function(data) {
    //         Loader.hide();
    //         console.log(data);
    //         if (data.error) {
    //           if (typeof data.error.message === 'object') {
    //             data.error.message = data.error.message.join('\n');
    //           }
    //           return swal('错误', data.error.message, 'error');
    //         }
    //         swal({
    //             title: "客服消息创建成功",
    //             text: "请修改内容后进行发送",
    //             type: "success"
    //           },
    //           function () {
    //             $('#create-group').modal('hide');
    //             location.reload();
    //           });
    //       }
    //     });
    //   }
    // });
    $('#create-group').on('hidden.bs.modal', function () {
      $('#create-group').remove();
    });
  });

})(window, document, window['jQuery'], module, exports, require, window['swal'], window['Qiniu'], window['QiniuConfig']);