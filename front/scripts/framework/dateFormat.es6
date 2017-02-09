'use strict';

(function(window, document, $, module, exports, require){

  module.exports = (function() {
    Date.prototype.format = function(fmt) {
      var hours = this.getHours();
      var o = {
        "M+" : this.getMonth()+1,                                         //月份
        "d+" : this.getDate(),                                            //日
        "h+" : hours>12?hours%12:hours,                                   //小时(12)
        "H+" : hours,                                                     //小时(24)
        "m+" : this.getMinutes(),                                         //分
        "s+" : this.getSeconds(),                                         //秒
        "q+" : Math.floor((this.getMonth()+3)/3),                         //季度
        "S"  : this.getMilliseconds()                                     //毫秒
      };
      if(/(y+)/.test(fmt))
        fmt=fmt.replace(RegExp.$1, (this.getFullYear()+"").substr(4 - RegExp.$1.length));
      for(var k in o)
        if(new RegExp("("+ k +")").test(fmt))
          fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));
      return fmt;
    }
  })();

})(window, document, window['jQuery'], module, exports, require);
