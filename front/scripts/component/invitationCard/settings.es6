'use strict';

(function(window, document, $, module, exports, require, swal, Qiniu, QiniuConfig){
  let Loader = require('component/common/loader');

  // 初始化 fabric canvas
  var canvasWidth = $('#canvas').parent().width();
  $('#canvas').attr('width', canvasWidth);
  $('#canvas').attr('height', 200);
  var canvas = new fabric.Canvas('canvas');
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
  $('[name=textColor]').on('change', function() {
    text.setColor($(this).val());
    canvas.renderAll();
  });
  $('[name=fontSize]').on('keypress', function(e) {
    if(e.keyCode === 13) {
      text.set({ fontSize: parseInt($(this).val()) || 14 });
      canvas.renderAll();
    }
  });
  $('[name=addAvatar]').on('click', function(e) {
    $('[name=addAvatar]').prop('disabled', true);
    $('[name=removeAvatar]').prop('disabled', false);
    canvas.add(avatarCircle);
    canvas.renderAll();
  });
  $('[name=removeAvatar]').on('click', function(e) {
    $('[name=addAvatar]').prop('disabled', false);
    $('[name=removeAvatar]').prop('disabled', true);
    avatarCircle.remove();
    canvas.renderAll();
  });
  $('[name=addUsername]').on('click', function(e) {
    $('[name=addUsername]').prop('disabled', true);
    $('[name=removeUsername]').prop('disabled', false);
    canvas.add(text);
    canvas.renderAll();
  })
  $('[name=removeUsername]').on('click', function(e) {
    $('[name=addUsername]').prop('disabled', false);
    $('[name=removeUsername]').prop('disabled', true);
    text.remove();
    canvas.renderAll();
  });

  // 初始化七牛
  var key, cropInfo, hasFile;
  var uploader = Qiniu.uploader({
    runtimes: 'html5',
    browse_button: `bg-upload-btn`,
    max_file_size: '1mb',
    dragdrop: false,
    chunk_size: '1mb',
    uptoken_url: '/api/qiniu/uptoken',
    unique_names: true,
    domain: QiniuConfig.domain,
    multi_selection: false,
    filters: {
      mime_types : [
        {title : "图片文件", extensions: "jpg,jpeg,png"}
      ]
    },
    auto_start: false,
    init: {
      FilesAdded: function(up, files) {
        if(files.length === 0 ) {
          $('[name=uploadFilePath]').empty();
        } else {
          var fileName = files[0].name;
          $('[name=uploadFilePath]').text(fileName);
        }
        var img = new mOxie.Image();
        img.onload = function() {
          // 重置 canvas 高度
          var scale = canvasWidth / this.width;
          canvas.setHeight(scale * this.height);
          // 删除原背景
          canvas.getObjects().forEach((o) => {
            if(o.fillRule === 'background') {
              o.remove();
            }
          });
          
          var dataUrl = this.getAsDataURL("image/jpeg", 100);
          fabric.Image.fromURL(dataUrl, function(oImg) {
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
          });
          
        };
        img.onembedded = function() {
          this.destroy();
        };
        img.onerror = function() {
          this.destroy();
        };
        img.load(files[0].getSource());
        hasFile = true;
      },
      BeforeUpload: function(up, file) {
      },
      FileUploaded: function(up, file, info) {
        var info = JSON.parse(info);
        var json = {};
        canvas.getObjects().forEach((o) => {
          if(o.fillRule === 'background') {
            json['background'] = {
              scale: o.scaleX,
              key: info.key
            };
          }
          if(o.type === 'rect') {
            json['qrCode'] = {
              size: o.width * o.scaleX,
              top: o.top,
              left: o.left
            };
          }
          if(o.type === 'circle') {
            json['avatar'] = {
              radius: o.width * o.scaleX / 2,
              top: o.top,
              left: o.left
            };
          }
          if(o.type === 'text') {
            json['avatar'] = {
              fontSize: o.fontSize,
              color: o.fill,
              top: o.top,
              left: o.left
            };
          }
        });
        $.ajax({
          url : '/api/admin/setting/invitedCardImage',
          type : 'PUT',
          data : JSON.stringify(json),
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
              },
              function () {
                window.location.href = '/admin/invitationCard';
              });
          }
        });
        console.log(json);
      },
      Error: function(up, err, errTip) {
        Loader.hide();
        alert(errTip);
      }
    }
  });

  $('[name=submitBtn]').click(function() {
    uploader.start();
  })

})(window, document, window['jQuery'], module, exports, require, window['swal'], window['Qiniu'], window['QiniuConfig']);