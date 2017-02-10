'use strict';

(function(window, document, $, module, exports, require, swal, Qiniu, QiniuConfig){
  let Loader = require('component/common/loader');
  let activityId = $('[name=activityId]').val();
  setInterval(function() {
    console.log('update stat');
    $.ajax({
      url: '/api/admin/activity/' + activityId + '/stat',
      type: 'GET',
      dataType: 'json',
      contentType: 'application/json',
      success: function (data) {
        if(data.stat) {
          $('#stat-table tbody').empty();
          data.stat.forEach(function(row) {
            let lastUsedAt = '-';
            if(row.lastUsedAt) {
              lastUsedAt = new Date(row.lastUsedAt).format('yyyy-MM-dd hh:mm:ss');
            }
            $('#stat-table tbody').append('\
            <tr data-id="' + row._id._id + '">\
              <td class="text-left">' + row._id.name + '</td>\
              <td class="text-center">' + row.total + '</td>\
              <td class="text-right"><small>' + lastUsedAt + '</small></td>\
            </tr>\
            ');
          });
        }
      }
    });
  }, 10000);
})(window, document, window['jQuery'], module, exports, require, window['swal'], window['Qiniu'], window['QiniuConfig']);