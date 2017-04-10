'use strict';

(function(window, document, $, module, exports, require, swal, Qiniu, QiniuConfig){
  let Loader = require('component/common/loader');
  let data = {};
  let _id = null;
  let $element = $;

  $('[name=modifyReplyBtn]').click(function() {
    $element = $(this).parents('.panel');
    _id = $element.data('id');
    $.ajax({
      type: 'GET',
      url: '/api/admin/subscribeReply/' + _id,
      data: 'json',
      contentType: 'application/json',
      success: function(resData) {
        data = resData;
        render();
        $('[name=modifyReplyBtn]').prop('disabled', true);
        $('[name=deleteReplyBtn]').prop('disabled', true);
      }
    });
  });

  function render() {
    $element.html(`
      <div class="panel-heading">
        等待 <input type="number" name='waitSeconds' min="0" class="form-control" autocomplete="off" style="width: 100px; display: inline-block;" value="${data.waitSeconds}"> 秒后回复
        <button class="btn btn-xs btn-default pull-right" name="cancelBtn">取消</button>
        <button class="btn btn-xs btn-green pull-right mr-sm" name="saveReplyBtn">保存</button>
        <button class="btn btn-xs btn-primary pull-right mr-sm" name="addImageBtn">增加图片</button>
        <button class="btn btn-xs btn-primary pull-right mr-sm" name="addTextBtn">增加文本</button>
      </div>
      <div class="panel-body pv0">
        <ul class="message-bubble-list">
          ${data.messages ? data.messages.map((message) => {
            if(message.type === 'text') {
              return `
                <li>
                  <span>${message.content}</span>
                  <div>
                    <button class="btn btn-danger btn-xs pull-right" name="deleteMessageBtn">删除</button>
                    <button class="btn btn-default btn-xs pull-right mr-sm" name="backwardMessageBtn">下移</button>
                    <button class="btn btn-default btn-xs pull-right mr-sm" name="forwardMessageBtn">上移</button>
                  </div>
                </li>`
            }
            if(message.type === 'image') {
              return `
                <li>
                  <a href="javascript:;" name="previewImageBtn" data-url="/admin/material/image/preview?mediaId=${message.mediaId}">
                    <img src="/admin/material/image/preview?mediaId=${message.mediaId}">
                  </a>
                  <div>
                    <button class="btn btn-danger btn-xs pull-right" name="deleteMessageBtn">删除</button>
                    <button class="btn btn-default btn-xs pull-right mr-sm" name="backwardMessageBtn">下移</button>
                    <button class="btn btn-default btn-xs pull-right mr-sm" name="forwardMessageBtn">上移</button>
                  </div>
                </li>`
            }
          }).join('') : ''}
        </ul>
      </div>
    `);
    bind($element);
  }

  function bind($element) {
    require('component/common/img_preview')();

    $element.find('[name=addTextBtn]').unbind().on('click', function(e) {
      $(this).parents('.panel').find('.message-bubble-list').append(`
        <li>
          <textarea class="form-control" name="message" placeholder="请输入消息内容"></textarea>
          <div>
            <button class="btn btn-default btn-xs pull-right" name="confirmTextBtn">确定</button>
            <button class="btn btn-default btn-xs pull-right mr-sm" name="cancelBtn">取消</button>
          </div>
        </li>
      `);
      // 禁止无关按钮触发
      disableBtnOnEditing();
      $element.find('[name=confirmTextBtn]').unbind().on('click', function() {
        let text = $element.find('textarea[name=message]').val();
        data.messages.push({
          type: 'text',
          content: text
        });
        render();
      });
      $element.find('[name=cancelBtn]').unbind().on('click', function() {
        render();
      });
    });
    $element.find('[name=addImageBtn]').unbind().on('click', function(e) {
      $(this).parents('.panel').find('.message-bubble-list').append(`
        <li>
          <button class="btn btn-default btn-xs" name="uploadImage">上传新图片</button>
          <button class="btn btn-default btn-xs" name="chooseImage">选择已有图片</button>
          <button class="btn btn-default btn-xs pull-right mr-sm" name="cancelBtn">取消</button>
        </li>
      `);
      // 禁止无关按钮触发
      disableBtnOnEditing();

      $element.find('[name=uploadImage]').unbind().on('click', function() {
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
            let formData = new FormData();
            formData.append('type', 'image');
            formData.append('file', $('input[type=file]')[0].files[0]);
            Loader.show();
            $.ajax({
              url : '/api/admin/material',
              type : 'POST',
              data : formData,
              cache: false,
              contentType: false,
              processData: false,
              success : function(resData) {
                Loader.hide();
                console.log(resData);
                if (resData.error) {
                  if (typeof resData.error.message === 'object') {
                    resData.error.message = resData.error.message.join('\n');
                  }
                  return swal('错误', resData.error.message, 'error');
                }
                swal({
                    title : "图片上传成功",
                    type : "success"
                  },
                  function () {
                    $('#create').modal('hide');
                    let mediaId = resData.media_id;
                    data.messages.push({
                      type: 'image',
                      mediaId: mediaId
                    });
                    render();
                  });
              }
            });
          }
        });
        $('#create').on('hidden.bs.modal', function () {
          $('#create').remove();
        });
      });

      let imgSelector = require('component/common/img_selector');
      imgSelector('[name=chooseImage]', function(mediaId) {
        data.messages.push({
          type: 'image',
          mediaId: mediaId
        });
        render();
      });

      $element.find('[name=cancelBtn]').unbind().on('click', function() {
        render();
      });
    });

    $element.find('[name=forwardMessageBtn]').unbind().on('click', function(e) {
      let messageIndex = $(this).parents('.message-bubble-list').find('li').index($(this).parents('li'));
      moveMessage(messageIndex, -1);
    });
    $element.find('[name=backwardMessageBtn]').unbind().on('click', function(e) {
      let messageIndex = $(this).parents('.message-bubble-list').find('li').index($(this).parents('li'));
      moveMessage(messageIndex, 1);
    });
    $element.find('[name=deleteMessageBtn]').unbind().on('click', function(e) {
      let messageIndex = $(this).parents('.message-bubble-list').find('li').index($(this).parents('li'));
      deleteMessage(messageIndex);
    });
    $element.find('[name=saveReplyBtn]').unbind().on('click', function() {
      let waitSeconds = parseInt($element.find('input[name=waitSeconds]').val() || 0);
      $.ajax({
        url : '/api/admin/subscribeReply/' + _id,
        type : 'PUT',
        data : JSON.stringify({
          waitSeconds: waitSeconds,
          messages: data.messages
        }),
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
              title : "回复消息组修改成功",
              type : "success"
            },
            function () {
              $('#modify').modal('hide');
              location.reload();
            });
        }
      });
      render();
    });
    $element.find('[name=cancelBtn]').unbind().on('click', function() {
      location.reload();
    });
  }

  function disableBtnOnEditing() {
    $element.find('[name=addTextBtn]').prop('disabled', true);
    $element.find('[name=addImageBtn]').prop('disabled', true);
    $element.find('[name=forwardMessageBtn]').prop('disabled', true);
    $element.find('[name=backwardMessageBtn]').prop('disabled', true);
    $element.find('[name=modifyMessageBtn]').prop('disabled', true);
    $element.find('[name=deleteMessageBtn]').prop('disabled', true);
    $element.find('[name=previewImageBtn]').prop('disabled', true);
  }

  function moveMessage(subIndex, offset) {
    let messageGroup = data.messages;
    let toIndex = subIndex + offset;
    (toIndex < 0) && (toIndex = 0);
    (toIndex > messageGroup.length-1) && (toIndex = messageGroup.length-1);
    _arrayMove(data.messages, subIndex, toIndex);
    render();
  }

  function deleteMessage(subIndex) {
    data.messages.splice(subIndex, 1);
    render();
  }

  function _arrayMove(arr, fromIndex, toIndex) {
    var element = arr[fromIndex];
    arr.splice(fromIndex, 1);
    arr.splice(toIndex, 0, element);
  }

})(window, document, window['jQuery'], module, exports, require, window['swal'], window['Qiniu'], window['QiniuConfig']);