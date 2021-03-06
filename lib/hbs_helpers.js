'use strict';

var _ = require('lodash');

module.exports = {
  inject: function (name) {
    var blocks  = this._blocks;
    var content = blocks && blocks[name];
    return content ? content.join('\n') : null;
  },
  block: function (name, options) {
    var blocks = this._blocks || (this._blocks = {});
    var block  = blocks[name] || (blocks[name] = []);
    block.push(options.fn(this));
  },
  json: function() {
    return JSON.stringify({
      _TITLE_:  this._TITLE_,
      _POINT_:  this._POINT_,
      _USER_:   this._USER_,
      _DATA_:   this._DATA_,
      _PARAMS_: this._PARAMS_,
      _QUERY_:  this._QUERY_,
      _PATH_:   this._PATH_,
      _MOBILE_USER_:   this._MOBILE_USER_,
      _SIGN_:   this._SIGN_
    }).replace(/</g, "&lt;").replace(/>/g, "&gt;");
  },
  stringify: function(object) {
    return encodeURIComponent(JSON.stringify(object));
  },
  equals: function(a, b, options) {
    if ((a != null ? a.toString() : void 0) === (b != null ? b.toString() : void 0)) {
      return options.fn(this);
    } else {
      return options.inverse(this);
    }
  },
  lt: function(a, b, options) {
    if (a < b) {
      return options.fn(this);
    } else {
      return options.inverse(this);
    }
  },
  lte: function(a, b, options) {
    if (a <= b) {
      return options.fn(this);
    } else {
      return options.inverse(this);
    }
  },
  gt: function(a, b, options) {
    if (a > b) {
      return options.fn(this);
    } else {
      return options.inverse(this);
    }
  },
  gte: function(a, b, options) {
    if (a >= b) {
      return options.fn(this);
    } else {
      return options.inverse(this);
    }
  },
  startsWith: function(a, b, options) {
    if ((a != null ? a.toString() : 'undefined').indexOf(b != null ? b.toString() : 'undefined') === 0) {
      return options.fn(this);
    } else {
      return options.inverse(this);
    }
  },
  plus: function(a1, a2) {
    return a1+a2;
  },
  join: function(arr, s) {
    if(!arr || !arr.length || !arr.join) return "-";
    var newArr = arr.map((x)=>((x+'').replace(/</g, "&lt;").replace(/>/g, "&gt;")));
    return newArr.join(s);
  },
  percent: function(a1, a2) {
    return Math.ceil(a1 / a2 * 100)
  },
  date: function(date, format) {
    if(!date) return `-`;
    if(typeof date === 'number' && (date+'').length === 10) {
      date = date * 1000;
    }
    var date = new Date(date);
    if(isNaN(date.getTime())) return `<span class="text-muted">时间错误</span>`;
    var dateFormat = function(date, fmt) {
      var hours = date.getHours();
      var o = {
        "M+" : date.getMonth()+1,                                         //月份
        "d+" : date.getDate(),                                            //日
        "h+" : hours>12?hours%12:hours,                                   //小时(12)
        "H+" : hours,                                                     //小时(24)
        "m+" : date.getMinutes(),                                         //分
        "s+" : date.getSeconds(),                                         //秒
        "q+" : Math.floor((date.getMonth()+3)/3),                         //季度
        "S"  : date.getMilliseconds()                                     //毫秒
      };
      if(/(y+)/.test(fmt))
        fmt=fmt.replace(RegExp.$1, (date.getFullYear()+"").substr(4 - RegExp.$1.length));
      for(var k in o)
        if(new RegExp("("+ k +")").test(fmt))
          fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));
      return fmt;
    }
    return dateFormat(date, format);
  },
  weSex: function(sex) {
    if(!sex || [0,1,2].indexOf(sex) < 0) return '-';
    return ['未知', '男', '女'][sex];
  },
  sendFeedback: function(raw) {
    let msg = String(raw);
    if(raw === 'Pending') return "等待中";
    if(raw === 'Queuing') return "发送队列中";
    if(raw === 'Sending') return "待微信反馈";
    if(raw === 'Success') return "成功";
    if(raw.toLowerCase().indexOf('user block') >= 0) return "用户拒收";
    if(raw.toLowerCase().indexOf('ESOCKETTIMEDOUT') >= 0) return "微信无反馈";
    if(raw.toLowerCase().indexOf('45015') >= 0) return "用户不活跃";
    return raw;
  },
  noEnter: function(s) {
    return s.replace(/[\r\n]/g, "");
  },
  in: function(a, b, options) {
    if (b.split(',').indexOf(a) >= 0) {
      return options.fn(this);
    } else {
      return options.inverse(this);
    }
  },
  notIn: function(a, b, options) {
    if (b.split(',').indexOf(a) < 0) {
      return options.fn(this);
    } else {
      return options.inverse(this);
    }
  }
}
