'use strict';

(function(window, document, $, module, exports, require, swal, Qiniu, QiniuConfig){
  let Loader = require('component/common/loader');
  console.log(_CARD_SETTING_)
  console.log(_MSG_SETTING_)

  let canvas = new fabric.Canvas('canvas');
  let canvasWidth = $('#canvas').width();
  let regex = /\{\{([^\}]*)\.DATA\}\}/g;
  let templateList = [];
  let templateMap = {};

  // 初始化已有邀请卡配置
  canvas.setHeight(canvasWidth/_CARD_SETTING_.width*_CARD_SETTING_.height);
  canvas.loadFromJSON(_CARD_SETTING_, function() {
    canvas.renderAll();
    var bg, text, avatarCircle;
    canvas.getObjects().forEach((o) => {
      if(o.fillRule === 'background') {
        bg = o;
        bg.set({
          hasControls: false,
          hasBorders: false,
          evented: false,
          selectable: false
        });
        canvas.sendToBack(bg);
        canvas.renderAll();
      }
      if(o.type === 'circle') {
        avatarCircle = o;
      }
      if(o.type === 'text') {
        text = o;
        $('[name=textColor]').val(o.fill);
        $('[name=fontSize]').val(o.fontSize);
      }
    });
    if(!text) {
      $('[name=addUsername]').prop('disabled', false);
      $('[name=removeUsername]').prop('disabled', true);
      text = new fabric.Text('[用户名]', { fontSize: 16, left: 140, top: 10, fill: 'black' });
      text.setControlsVisibility({ bl: false, br: false, mb: false, ml: false, mr: false, mt: false, tl: false, tr: false, mtr: false });
    }
    if(!avatarCircle) {
      $('[name=addAvatar]').prop('disabled', false);
      $('[name=removeAvatar]').prop('disabled', true);
      avatarCircle = new fabric.Circle({ left: 60, top: 0, fill: 'red', radius: 30, lockRotation: true, lockScalingFlip: true, lockSkewingX: true, lockSkewingY: true });
      avatarCircle.setControlsVisibility({ bl: true, br: true, mb: false, ml: false, mr: false, mt: false, tl: true, tr: true, mtr: false });
    }
    // 按钮绑定
    $('[name=textColor]').unbind().bind('change', function() {
      text.setColor($(this).val());
      canvas.renderAll();
    });
    $('[name=fontSize]').unbind().bind('keypress', function(e) {
      if(e.keyCode === 13) {
        text.set({ fontSize: parseInt($(this).val()) || 14 });
        canvas.renderAll();
      }
    });
    $('[name=addAvatar]').unbind().bind('click', function(e) {
      $('[name=addAvatar]').prop('disabled', true);
      $('[name=removeAvatar]').prop('disabled', false);
      canvas.add(avatarCircle);
      canvas.renderAll();
    });
    $('[name=removeAvatar]').unbind().bind('click', function(e) {
      $('[name=addAvatar]').prop('disabled', false);
      $('[name=removeAvatar]').prop('disabled', true);
      avatarCircle.remove();
      canvas.renderAll();
    });
    $('[name=addUsername]').unbind().bind('click', function(e) {
      $('[name=addUsername]').prop('disabled', true);
      $('[name=removeUsername]').prop('disabled', false);
      canvas.add(text);
      canvas.renderAll();
    })
    $('[name=removeUsername]').unbind().bind('click', function(e) {
      $('[name=addUsername]').prop('disabled', false);
      $('[name=removeUsername]').prop('disabled', true);
      text.remove();
      canvas.renderAll();
    });
  });

  // 初始化文件选择按钮
  $('#bg-upload-btn').click(function() {
    let $fileInput = $('<input type="file" name="bg" accept="image/png,image/jpg" style="display: none;">');
    $(this).parent().append($fileInput);
    $fileInput.bind('change', function(e) {
      // 文件大小检测
      if(this.files[0].size > 1024 * 1024) {
        alert('文件大小不得超过 1MB！');
        return;
      }
      // 获取图片 local url
      let url = URL.createObjectURL(this.files[0]);
      // 显示图片路径
      $('[name=uploadBgPath]').text(this.files[0].name);
      // 获取图片的宽高
      let img = new Image();
      img.onload = function() {
        // 重置 canvas 高度
        let scale = canvasWidth / this.width;
        canvas.setHeight(scale * this.height);
        // 删除所有元素
        canvas.clear();
        // 取得 base64
        let tplCanvas = document.createElement('CANVAS');
        let tplctx = tplCanvas.getContext('2d');
        tplCanvas.height = this.height;
        tplCanvas.width = this.width;
        tplctx.drawImage(this, 0, 0);
        let base64 = tplCanvas.toDataURL('image/png');
        tplCanvas = null;
        tplctx = null;
        
        fabric.Image.fromURL(base64, function(oImg) {
          oImg.scale(scale);
          oImg.set({
            fillRule: 'background',
            perPixelTargetFind: true,
            hasControls: false,
            hasBorders: false,
            evented: false,
            selectable: false
          });
          canvas.add(oImg);
          canvas.sendToBack(oImg);
          canvas.renderAll();

          // 二维码
          var qrRect = new fabric.Rect({ left: 0, top: 0, fill: 'green', width: 60, height: 60, lockRotation: true, lockScalingFlip: true, lockSkewingX: true, lockSkewingY: true });
          qrRect.setControlsVisibility({ bl: true, br: true, mb: false, ml: false, mr: false, mt: false, tl: true, tr: true, mtr: false });
          canvas.add(qrRect);
          // 头像
          var avatarCircle = new fabric.Circle({ left: 60, top: 0, fill: 'red', radius: 30, lockRotation: true, lockScalingFlip: true, lockSkewingX: true, lockSkewingY: true });
          avatarCircle.setControlsVisibility({ bl: true, br: true, mb: false, ml: false, mr: false, mt: false, tl: true, tr: true, mtr: false });
          canvas.add(avatarCircle);
          // 用户名
          var text = new fabric.Text('[用户名]', { fontSize: 16, left: 140, top: 10, fill: 'black' });
          text.setControlsVisibility({ bl: false, br: false, mb: false, ml: false, mr: false, mt: false, tl: false, tr: false, mtr: false });
          canvas.add(text);
          // 按钮绑定
          $('[name=textColor]').unbind().bind('change', function() {
            text.setColor($(this).val());
            canvas.renderAll();
          });
          $('[name=fontSize]').unbind().bind('keypress', function(e) {
            if(e.keyCode === 13) {
              text.set({ fontSize: parseInt($(this).val()) || 14 });
              canvas.renderAll();
            }
          });
          $('[name=addAvatar]').unbind().bind('click', function(e) {
            $('[name=addAvatar]').prop('disabled', true);
            $('[name=removeAvatar]').prop('disabled', false);
            canvas.add(avatarCircle);
            canvas.renderAll();
          });
          $('[name=removeAvatar]').unbind().bind('click', function(e) {
            $('[name=addAvatar]').prop('disabled', false);
            $('[name=removeAvatar]').prop('disabled', true);
            avatarCircle.remove();
            canvas.renderAll();
          });
          $('[name=addUsername]').unbind().bind('click', function(e) {
            $('[name=addUsername]').prop('disabled', true);
            $('[name=removeUsername]').prop('disabled', false);
            canvas.add(text);
            canvas.renderAll();
          })
          $('[name=removeUsername]').unbind().bind('click', function(e) {
            $('[name=addUsername]').prop('disabled', false);
            $('[name=removeUsername]').prop('disabled', true);
            text.remove();
            canvas.renderAll();
          });
        });
      }
      img.src = url;
    });
    $fileInput.trigger('click');
  });

  // 初始化模板消息编辑
  $.ajax({
    url : '/api/admin/messageTemplate',
    type : 'GET',
    dataType: 'json',
    contentType: 'application/json',
    success : function(resData) {
      templateList = resData.template_list;

      $('#create-message').find('[name=templateId]').html(`
        <option value="null" selected disabled>请选择模板...</option>
        ${templateList.map((template) => {
          templateMap[template.template_id] = template;
          return `<option value="${template.template_id}" ${_MSG_SETTING_.templateId==template.template_id ? 'selected="selected"' : ""}>${template.title}</option>`;
        }).join('')}
      `).selectric().on('change', function() {
        let templateId = $(this).val();
        let currentTemplate = templateMap[templateId];
        if(!currentTemplate) return;
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
                <input type="color" name="${param}Color" class="color-input pull-right"
                       value="${_MSG_SETTING_ && _MSG_SETTING_.data && _MSG_SETTING_.data[param] ? `${_MSG_SETTING_.data[param].color}` : `#000000`}">
                <label>@${param}</label>
                <input type="text" name='${param}' placeholder="${param}" 
                       class="form-control param-input" required autocomplete="off" 
                       value="${_MSG_SETTING_ && _MSG_SETTING_.data && _MSG_SETTING_.data[param] ? `${_MSG_SETTING_.data[param].value}` : `{{${param}.DATA}}`}">
              </div>
            `;
          }).join('')}
        `);
        $('#create-message').find('#preview-area pre').html(currentTemplate.content);
        $('.param-input').on('blur keyup propertychange', function () {
          renderPreviewArea();
        });
        $('.color-input').on('change', function () {
          renderPreviewArea();
        });
        function renderPreviewArea() {
          let previewContent = currentTemplate.content;
          $('.param-input').each(function() {
            let k = $(this).attr('name');
            let v = $(this).val();
            let color = $(`[name=${k}Color]`).val();
            previewContent = previewContent.replace(`{{${k}.DATA}}`, `<span style="color: ${color}">${v}</span>`);
          });
          $('#create-message').find('#preview-area pre').html(previewContent);
        }
        $('.color-input').first().trigger('change');
      }).trigger('change');
    }
  });

  $('[name=uploadImage]').on('click', function() {
    $('body').append($('#create-tpl').html());
    $('#create').modal({backdrop: 'static', keyboard: false});
    $('[name=submitBtn]').prop('disabled', true);

    $('input[name=file]').on("change", function (e) {
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
      $('input[name=file]').trigger('click');
    })

    $('#create #image-form').on('submit', function (e) {
      if (e.isDefaultPrevented()) {
      } else {
        e.preventDefault();
        let formData = new FormData();
        formData.append('type', 'image');
        formData.append('file', $('input[name=file]')[0].files[0]);
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
              $('[name=rewardImage]')
                .attr('src', '/admin/material/image/preview?mediaId=' + mediaId)
                .data('mediaId', mediaId);
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
    $('[name=rewardImage]')
      .attr('src', '/admin/material/image/preview?mediaId=' + mediaId)
      .data('mediaId', mediaId);
  });

  // 提交按钮绑定
  $('[name=submitTaskBtn]').click(function() {
    let name = $('[name=taskName]').val() || '';
    if(!name) return alert('您没有配置任务名称');

    let threshold = Number($('[name=threshold]').val());
    if(!threshold) return alert('您没有配置奖励阈值；奖励阈值需大于0');

    let rewardType = $('[name=rewardType]').val() || 'TEMPLATE';
    let introduction = $('[name=introduction]').val() || '';

    let rewardText = $('[name=rewardText]').val() || '';
    let rewardImageMediaId = $('[name=rewardImage]').data('mediaId');
    if(rewardType === 'CUSTOM' && !rewardText) return alert('您没有配置提示文字');

    let invitedFeedback = $('[name=invitedFeedback]').val() || undefined;

    let cardSetting = canvas.toJSON();
    cardSetting.width = $('#canvas').width();
    cardSetting.height = $('#canvas').height();
    if(cardSetting.objects.length === 0) return alert('您没有配置邀请卡背景');

    let rewardMessageSetting = {}
    rewardMessageSetting.templateId = $('[name=templateId]').val() || '';
    if(rewardType === 'TEMPLATE' && !rewardMessageSetting.templateId) return alert('您没有配置模板');
    rewardMessageSetting.url = $('[name=url]').val() || '';
    rewardMessageSetting.previewHtml = $('#preview-area pre').html() || '';
    rewardMessageSetting.data = {};
    $('.param-input').each(function() {
      let k = $(this).attr('name');
      let v = $(this).val();
      let color = $(`[name=${k}Color]`).val();
      rewardMessageSetting.data[k] = {
        "value": v && v.replace(new RegExp('<br>', 'g'), '\n'),
        "color": color
      }
    });
    
    Loader.show();
    let id = $('[name=id]').val();
    $.ajax({
      url : '/api/admin/invitationTask/' + id,
      type : 'PUT',
      data : JSON.stringify({ name, threshold, rewardType, cardSetting, introduction, invitedFeedback,
                              rewardMessageSetting, rewardText, rewardImageMediaId }),
      dataType: 'json',
      contentType: 'application/json',
      success : function(data) {
        Loader.hide();
        if (data.error) {
          if (typeof data.error.message === 'object') {
            data.error.message = data.error.message.join('\n');
          }
          return swal('错误', data.error.message, 'error');
        }
        swal({
          title : "任务修改成功",
          type : "success"
        },
        function () {
          window.location.href = '/admin/invitationTask';
        });
      }
    });
  });

})(window, document, window['jQuery'], module, exports, require, window['swal'], window['Qiniu'], window['QiniuConfig']);