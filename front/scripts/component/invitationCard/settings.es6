'use strict';

(function(window, document, $, module, exports, require, swal, Qiniu, QiniuConfig){
  let Loader = require('component/common/loader');

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
          var dataUrl = this.getAsDataURL("image/jpeg", 100);
          var width = parseInt($('#canvas').attr('width'));
          var scale = width / this.width;
          $('#canvas').attr('height', scale*this.height)
          $('#card-editor').show();

          var canvas = new fabric.Canvas('canvas');
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
            var qrRect = new fabric.Rect({ left: 0, top: 0, fill: 'green', width: 60, height: 60, lockRotation: true, lockScalingFlip: true, lockSkewingX: true, lockSkewingY: true });
            qrRect.setControlsVisibility({ bl: true, br: true, mb: false, ml: false, mr: false, mt: false, tl: true, tr: true, mtr: false });
            canvas.add(qrRect);
            var avatarCircle = new fabric.Circle({ left: 60, top: 0, fill: 'red', radius: 40, lockRotation: true, lockScalingFlip: true, lockSkewingX: true, lockSkewingY: true });
            avatarCircle.setControlsVisibility({ bl: true, br: true, mb: false, ml: false, mr: false, mt: false, tl: true, tr: true, mtr: false });
            canvas.add(avatarCircle);
            var text = new fabric.Text('[用户名]', { fontSize: 16, left: 140, top: 10, fill: 'black' });
            text.setControlsVisibility({ bl: false, br: false, mb: false, ml: false, mr: false, mt: false, tl: false, tr: false, mtr: false });
            canvas.add(text);
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
            })
          });
          // 

          // var rect = new fabric.Rect({
          //   left: 100,
          //   top: 100,
          //   fill: 'gray',
          //   width: 20,
          //   height: 20
          // });

          // // "add" rectangle onto canvas
          // canvas.add(rect);
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
        key = info.key;
        var fopArr = [{
          'fop': 'imageMogr2',
          'auto-orient': true,
          'strip': true,
          'crop': `!${cropInfo.width}x${cropInfo.height}a${cropInfo.x}a${cropInfo.y}`,
          'quality': 100,
          'format': 'png'
        }, {
          'fop': 'imageMogr2',
          'thumbnail': `${width}x${height}`,
          'quality': 100,
          'format': 'png'
        }]
        var link = Qiniu.pipeline(fopArr, key);
        key = key + '?' + link.split('?')[1];
        if(callback) callback(key);
      },
      Error: function(up, err, errTip) {
        Loader.hide();
        alert(errTip);
      }
    }
  });

})(window, document, window['jQuery'], module, exports, require, window['swal'], window['Qiniu'], window['QiniuConfig']);