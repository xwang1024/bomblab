

'use strict';

(function(window, document, $, module, exports, require, swal, Qiniu, QiniuConfig){
  let Loader = require('component/common/loader');
  let WechatMenu = require('component/menu/wechat_menu');

  let wechatMenu = new WechatMenu('#menuList');
  wechatMenu.setSelectMenuHandler(onMenuSelected);
  wechatMenu.setSelectSubMenuHandler(onSubMenuSelected);

  Loader.show();
  $.ajax({
    url : '/api/admin/menu',
    type : 'GET',
    dataType: 'json',
    contentType: 'application/json',
    success : (data) => {
      Loader.hide();
      console.log(data);
      if (data.error) {
        if (typeof data.error.message === 'object') {
          data.error.message = data.error.message.join('\n');
        }
        return swal('错误', data.error.message, 'error');
      }
      wechatMenu.init(data);
    }
  });

  $('[name=updateMenuBtn]').unbind().on('click', function() {
    let menuData = wechatMenu.getData();
    console.log(menuData);
    Loader.show();
    $.ajax({
      url : '/api/admin/menu',
      type : 'PUT',
      data : JSON.stringify({menuConfig: menuData}),
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
            title : "自定义菜单修改成功",
            type : "success"
          },
          function () {
            location.reload();
          });
      }
    });
  });

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
                  <input type="text" class="form-control" name="key" value="${menuData.key ? (menuData.key.split('-')[1] || ''): ''}">
                </div>
              </div>
            </div>
          `: ""}
          ${menuData.type==='view' ? `
            <div class="form-group">
              <label>跳转链接地址</label>
              <input type="text" class="form-control" name="url" placeholder="例如：https://www.baidu.com/" value="${menuData.url || ''}">
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
        if(data.type === 'click') {
          data.key = data.keyPrefix + '-' + data.key;
          delete data.keyPrefix;
        }
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