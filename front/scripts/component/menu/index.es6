

'use strict';

(function(window, document, $, module, exports, require, swal, Qiniu, QiniuConfig){
  let Loader = require('component/common/loader');
  let WechatMenu = require('component/menu/wechat_menu');

  let menu = {
    "menu": {
      "button": [
        // {
        //   "type": "click",
        //   "name": "今日歌曲",
        //   "key": "V1001_TODAY_MUSIC",
        //   "sub_button": []
        // },
        {
          "type": "click",
          "name": "歌手简介",
          "key": "V1001_TODAY_SINGER",
          "sub_button": []
        },
        {
          "name": "菜单",
          "sub_button": [
            {
              "type": "view",
              "name": "搜索",
              "url": "http://www.soso.com/",
              "sub_button": []
            },
            {
              "type": "view",
              "name": "视频",
              "url": "http://v.qq.com/",
              "sub_button": []
            },
            {
              "type": "click",
              "name": "赞一下我们",
              "key": "V1001_GOOD",
              "sub_button": []
            }
          ]
        }
      ]
    }
  }

  let wechatMenu = new WechatMenu('#menuList');
  wechatMenu.setSelectMenuHandler(onMenuSelected);
  wechatMenu.setSelectSubMenuHandler(onSubMenuSelected);
  wechatMenu.init();

  function onMenuSelected(menuData, index) {
    console.log(menuData, index);
  }

  function onSubMenuSelected(subMenuData, subIndex, menuData, index) {
    console.log(subMenuData, subIndex, menuData, index);
  }

})(window, document, window['jQuery'], module, exports, require, window['swal'], window['Qiniu'], window['QiniuConfig']);