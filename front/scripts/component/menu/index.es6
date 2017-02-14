

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
    renderMenuPanel(menuData, index, undefined);
  }

  function onSubMenuSelected(subMenuData, subIndex, menuData, index) {
    renderSubMenuPanel(subMenuData, index, subIndex);
  }

  function renderMenuPanel(menuData, index, subIndex) {
    $('#menu-config-area').html(`
      <form id='menu-option-form'>
        <div class="form-group">
          <label>名称</label>
          <input type="text" name='name' placeholder="请输入名称" class="form-control" required autocomplete="off" value="${menuData.name}">
        </div>
        ${!menuData.sub_button || menuData.sub_button.length === 0 ? `
          <div class="form-group">
            <label>类型</label>
            <select name="type" class="form-control">
              <option value="click"${menuData.type==='click' ? " selected": ""}>触发事件</option>
              <option value="view"${menuData.type==='view' ? " selected": ""}>跳转链接</option>
            </select>
          </div>
          ${menuData.type==='click' ? `
            <div class="form-group">
              <div class="row">
                <div class="col-md-6">
                  <label>事件</label>
                  <select name="keyPrefix" class="form-control">
                    <option value="message">发送消息 / 发送消息序列</option>
                  </select>
                </div>
                <div class="col-md-6">
                  <label>key</label>
                  <input type="text" class="form-control" name="key">
                </div>
              </div>
            </div>
          `: ""}
          ${menuData.type==='view' ? `
            <div class="form-group">
              <label>跳转链接地址</label>
              <input type="text" class="form-control">
            </div>
          `: ""}
        `: ''}
        <button type="button" class="btn btn-primary" name='forwardBtn'>前移</button>
        <button type="button" class="btn btn-primary" name='backwardBtn'>后移</button>

        <button type="button" class="btn btn-danger pull-right" name='deleteBtn'>删除</button>
        <button type="submit" class="btn btn-green pull-right mr" name='submitBtn'>保存</button>
      </form>
    `);
    $('select').selectric();
    
    $('select[name=type]').selectric().on('change', function() {
      menuData.type = $(this).val();
      renderMenuPanel(menuData, index, subIndex);
    });

    $('[name=forwardBtn]').on('click', function() {
      wechatMenu.moveMenu(index, -1);
    });

    $('[name=backwardBtn]').on('click', function() {
      wechatMenu.moveMenu(index, 1);
    });

    $('#menu-option-form').on('submit', function(e) {
      if (e.isDefaultPrevented()) {
      } else {
        e.preventDefault();
        let data = $(this).serializeArray().reduce(function(obj, item) {
          obj[item.name] = item.value;
          return obj;
        }, {});
        wechatMenu.updateMenu(index, data);
      }
    });
    
    $('[name=deleteBtn]').on('click', function() {
      wechatMenu.deleteMenu(index);
    });
  }

  function renderSubMenuPanel(subMenuData, index, subIndex) {
    $('#menu-config-area').html(`
      <form id='menu-option-form'>
        <div class="form-group">
          <label>名称</label>
          <input type="text" name='name' placeholder="请输入名称" class="form-control" required autocomplete="off" value="${subMenuData.name}">
        </div>
        <div class="form-group">
          <label>类型</label>
          <select name="type" class="form-control">
            <option value="click"${subMenuData.type==='click' ? " selected": ""}>触发事件</option>
            <option value="view"${subMenuData.type==='view' ? " selected": ""}>跳转链接</option>
          </select>
        </div>
        ${subMenuData.type==='click' ? `
          <div class="form-group">
            <div class="row">
              <div class="col-md-6">
                <label>事件</label>
                <select name="keyPrefix" class="form-control">
                  <option value="message">发送消息 / 发送消息序列</option>
                </select>
              </div>
              <div class="col-md-6">
                <label>key</label>
                <input type="text" class="form-control" name="key">
              </div>
            </div>
          </div>
        `: ""}
        ${subMenuData.type==='view' ? `
          <div class="form-group">
            <label>跳转链接地址</label>
            <input type="text" class="form-control">
          </div>
        `: ""}
        <button type="button" class="btn btn-primary" name='forwardBtn'>上移</button>
        <button type="button" class="btn btn-primary" name='backwardBtn'>下移</button>

        <button type="button" class="btn btn-danger pull-right" name='deleteBtn'>删除</button>
        <button type="submit" class="btn btn-green pull-right mr" name='submitBtn'>保存</button>
      </form>
    `);
    $('select').selectric();
    
    $('select[name=type]').selectric().on('change', function() {
      subMenuData.type = $(this).val();
      renderSubMenuPanel(subMenuData, index, subIndex);
    });

    $('[name=forwardBtn]').on('click', function() {
      wechatMenu.moveSubMenu(index, subIndex, -1);
    });

    $('[name=backwardBtn]').on('click', function() {
      wechatMenu.moveSubMenu(index, subIndex, 1);
    });

    $('#menu-option-form').on('submit', function(e) {
      if (e.isDefaultPrevented()) {
      } else {
        e.preventDefault();
        let data = $(this).serializeArray().reduce(function(obj, item) {
          obj[item.name] = item.value;
          return obj;
        }, {});
        wechatMenu.updateSubMenu(index, subIndex, data);
      }
    });
    
    $('[name=deleteBtn]').on('click', function() {
      wechatMenu.deleteSubMenu(index, subIndex);
    });
  }



})(window, document, window['jQuery'], module, exports, require, window['swal'], window['Qiniu'], window['QiniuConfig']);