'use strict';

(function(window, document, $, module, exports, require, swal, Qiniu, QiniuConfig){
  let Loader = require('component/common/loader');
  let htmlTpl = `
    <div class="modal fade" id="image-selector" tabindex="-1" role="dialog" aria-labelledby="selectLabel" aria-hidden="true">
      <div class="modal-dialog modal-lg">
        <div class="loader" style="display: none;">
          <div class="whirl traditional"></div>
        </div>
        <div class="modal-content">
        <div class="modal-header">
          <button type="button" class="close" data-dismiss="modal" aria-hidden="true"> &times;</button>
          <h4 class="modal-title" id="selectLabel">选择要插入的素材</h4>
        </div>
        <div class="modal-body">
          
        </div>
        <div class="modal-footer">
          <div class="pagination-sm pull-left" id='sub-pagination-container' style="margin-bottom:-10px;"></div>
          <button type="button" class="btn btn-default" data-dismiss="modal">取消</button>
        </div>
      </div>
    </div>
  `;

  module.exports = function(buttonSelector, callback) {
    $(buttonSelector).click(function() {
      $('body').append(htmlTpl);
      $('#image-selector').modal({backdrop: 'static', keyboard: false});
      Loader.show('#image-selector');

      function updateImages(page) {
        $.ajax({
          type: 'GET',
          url: '/api/admin/material/image',
          dataType: 'json',
          contentType: 'application/json',
          data: {
            page: page || 1,
            pageSize: 10
          },
          success: function(resData) {
            Loader.hide('#image-selector');

            // 初始化分页器
            let pageCount = parseInt(resData.pageCount);
            let page = parseInt(resData.page);
            $('#sub-pagination-container').twbsPagination({
              first: '首页',
              prev: '上一页',
              next: '下一页',
              last: '尾页',
              totalPages: pageCount || 1,
              visiblePages: 5,
              startPage: page || 1,
              onPageClick: function (event, page) {
                updateImages(page);
              }
            });

            // 初始化内容
            $('#image-selector .modal-body').html(`
              <div class="row-masonry row-masonry-md-5 row-masonry-sm-2">
                ${resData.result.map((img) => {
                  return `<div class="col-masonry">
                    <a href="javascript:;" data-dismiss="modal" data-media-id="${img.media_id}"><img src="/admin/material/image/preview?mediaId=${img.media_id}" alt="" class="img-thumbnail img-responsive"></a>
                  </div>`
                }).join('')}
              </div>
            `);
            $('#image-selector a').unbind().bind('click', function () {
              let mediaId = $(this).data('mediaId');
              callback(mediaId);
            });
          }
        })
      }
      updateImages();
      
      $('#image-selector').on('hidden.bs.modal', function () {
        $('#image-selector').remove();
      });
    });
  }

})(window, document, window['jQuery'], module, exports, require, window['swal'], window['Qiniu'], window['QiniuConfig']);