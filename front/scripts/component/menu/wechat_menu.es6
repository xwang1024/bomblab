

'use strict';

(function(window, document, $, module, exports, require, swal, Qiniu, QiniuConfig){
  class WechatMenu {
    constructor(ctnSelector) {
      this.$element = $(ctnSelector);
    }

    // 初始化自定义菜单
    init(data) {
      if(!data || !data.menu || !data.menu.button) {
        console.log('self-inited wechat menu')
        data = {
          menu: {
            button: []
          }
        }
      }
      this.data = data;
      this._render();
    }

    _render() {
      let menuCnt = this.data.menu.button.length;
      let liHtmlList = this.data.menu.button.map((btnConfig) => {
        return this._genMenuHtml(btnConfig, menuCnt);
      });
      let addMenuHtml = `
        <li class="js_addMenuBox pre_menu_item grid_item no_extra size1of${menuCnt+1}">
          <a href="javascript:;" class="pre_menu_link js_addL1Btn" title="最多添加3个一级菜单" draggable="false">
            <i class="fa fa-plus"></i>
          </a>
        </li>
      `;
      if(liHtmlList.length < 3) liHtmlList.push(addMenuHtml);
      this.$element.html(liHtmlList.join(''));
      this._bind();
    }

    _genMenuHtml(btnConfig, menuCnt) {
      return `
        <li class="jsMenu pre_menu_item grid_item jslevel1 ui-sortable ui-sortable-disabled size1of${(menuCnt+1)>=3?3:(menuCnt+1)}">
          <a href="javascript:;" class="pre_menu_link" draggable="false">
            ${(btnConfig.sub_button && btnConfig.sub_button.length) ? '<i class="fa fa-bars"></i>' : ''}
            <span class="js_l1Title">${btnConfig.name}</span>
          </a>
          <div class="sub_pre_menu_box js_l2TitleBox">
            <ul class="sub_pre_menu_list">
              ${(btnConfig.sub_button && btnConfig.sub_button.length) ? btnConfig.sub_button.map((subBtnConfig) => {
                  return `
                    <li class="jslevel2">
                      <a href="javascript:;" class="jsSubView" draggable="false">
                        <span class="sub_pre_menu_inner js_sub_pre_menu_inner">
                          <span class="js_l2Title">${subBtnConfig.name}</span>
                        </span>
                      </a>
                    </li>
                  `
                }).join('') : ''
              }
              
              <li class="js_addMenuBox ${(btnConfig.sub_button && btnConfig.sub_button.length >= 5) && 'hidden'}" >
                <a href="javascript:;" class="jsSubView js_addL2Btn" title="最多添加5个子菜单" draggable="false">
                  <span class="sub_pre_menu_inner js_sub_pre_menu_inner">
                    <i class="fa fa-plus"></i>
                  </span>
                </a>
              </li>
            </ul>
              <i class="arrow arrow_out"></i>
              <i class="arrow arrow_in"></i>
          </div>
        </li>
      `
    }

    _bind() {
      let vm = this;
      this.$element.find('.jslevel1').unbind().bind('click', function(e) {
        vm.$element.find('.jslevel1').removeClass('active');
        vm.$element.find('.jslevel2').removeClass('active');
        $(this).addClass('active');
        let index = vm.$element.find('.jslevel1').index(this);
        let currentMenu = vm.data.menu.button[index];
        vm.selectMenuHandler && vm.selectMenuHandler(currentMenu, index);
      });
      this.$element.find('.jslevel2').unbind().bind('click', function(e) {
        e.stopPropagation();
        vm.$element.find('.jslevel2').removeClass('active');
        $(this).addClass('active');
        let index = vm.$element.find('.jslevel1').index($(this).parents('.jslevel1')[0]);
        let subIndex = $($(this).parents('.jslevel1')[0]).find('.jslevel2').index(this);
        let currentMenu = vm.data.menu.button[index];
        let currentSubMenu = currentMenu.sub_button[subIndex];
        vm.selectSubMenuHandler && vm.selectSubMenuHandler(currentSubMenu, subIndex, currentMenu, index);
      });
      this.$element.find('.js_addL1Btn').unbind().bind('click', function(e) {
        vm.addMenu({
          "type": "click",
          "name": "新菜单",
          "key": "",
          "sub_button": []
        });
      });
      this.$element.find('.js_addL1Btn').unbind().bind('click', function(e) {
        vm.addMenu({
          "type": "click",
          "name": "新菜单",
          "key": "",
          "sub_button": []
        });
      });
      this.$element.find('.js_addL2Btn').unbind().bind('click', function(e) {
        let index = vm.$element.children('.jsMenu').index($(this).parents('.jsMenu')[0]);
        vm.addSubMenu(index, {
          "type": "click",
          "name": "新按钮",
          "key": "",
          "sub_button": []
        });
      });
    }

    addMenu(data) {
      let menuLength = this.data.menu.button.length;
      if(menuLength >= 3) return swal('error', '您最多可以添加3个一级菜单');
      this.data.menu.button.push(data);
      this._render();
      this._selectMenu(this.data.menu.button.length-1);
    }

    addSubMenu(index, data) {
      let currentMenu = this.data.menu.button[index];
      if(!currentMenu) return swal('error', '找不到当前菜单');
      if(!currentMenu.sub_button) {
        currentMenu.sub_button = [];
      }
      if(currentMenu.sub_button.length >= 5) return swal('error', '您最多可以添加5个二级菜单');
      currentMenu.sub_button.push(data);
      this._render();
      this._selectSubMenu(index, currentMenu.sub_button.length-1);
    }

    updateMenu(index, data) {
      let currentMenu = this.data.menu.button[index];
      if(!currentMenu) return swal('error', '找不到当前菜单');
      if(currentMenu.sub_button.length) {
        this.data.menu.button[index].name = data.name;
      } else {
        this.data.menu.button[index] = data;
        this.data.menu.button[index].sub_button = [];
      }
      console.log(index, this.data);
      this._render();
      this._selectMenu(index);
    }

    updateSubMenu(index, subIndex, data) {
      let currentMenu = this.data.menu.button[index];
      if(!currentMenu) return swal('error', '找不到当前菜单');
      let currentSubMenu = currentMenu.sub_button[subIndex];
      if(!currentSubMenu) return swal('error', '找不到当前子菜单');
      currentMenu.sub_button[subIndex] = data;
      this._render();
      this._selectSubMenu(index, subIndex)
    }

    deleteMenu(index) {
      let currentMenu = this.data.menu.button[index];
      if(!currentMenu) return swal('error', '找不到当前菜单');
      this.data.menu.button.splice(index, 1);
      this._render();
    }

    deleteSubMenu(index, subIndex) {
      let currentMenu = this.data.menu.button[index];
      if(!currentMenu) return swal('error', '找不到当前菜单');
      let currentSubMenu = currentMenu.sub_button;
      if(!currentSubMenu) return swal('error', '找不到当前子菜单');
      currentSubMenu.splice(subIndex, 1);
      this._render();
      this._selectMenu(index);
    }

    moveMenu(index, offset) {
      let currentMenu = this.data.menu.button[index];
      if(!currentMenu) return swal('error', '找不到当前菜单');
      let toIndex = index + offset;
      (toIndex < 0) && (toIndex = 0);
      (toIndex > this.data.menu.button.length-1) && (toIndex = this.data.menu.button.length-1);
      (toIndex > 2) && (toIndex = 2);
      this._arrayMove(this.data.menu.button, index, toIndex);
      this._render();
      this._selectMenu(toIndex);
    }

    moveSubMenu(index, subIndex, offset) {
      let currentMenu = this.data.menu.button[index];
      if(!currentMenu) return swal('error', '找不到当前菜单');
      let currentSubMenu = currentMenu.sub_button[subIndex];
      if(!currentSubMenu) return swal('error', '找不到当前子菜单');
      let toIndex = subIndex + offset;
      (toIndex < 0) && (toIndex = 0);
      (toIndex > currentMenu.sub_button.length-1) && (toIndex = currentMenu.sub_button.length-1);
      (toIndex > 4) && (toIndex = 4);
      console.log(toIndex)
      this._arrayMove(currentMenu.sub_button, subIndex, toIndex);
      this._render();
      this._selectSubMenu(index, toIndex);
    }

    _arrayMove(arr, fromIndex, toIndex) {
      var element = arr[fromIndex];
      arr.splice(fromIndex, 1);
      arr.splice(toIndex, 0, element);
    }

    _selectMenu(index) {
      $(this.$element.find('.jslevel1')[index]).trigger('click');
    }

    _selectSubMenu(index, subIndex) {
      this._selectMenu(index);
      $($(this.$element.find('.jslevel1')[index]).find('.jslevel2')[subIndex]).trigger('click');
    }

    setSelectMenuHandler(fn) {
      this.selectMenuHandler = fn;
    }

    setSelectSubMenuHandler(fn) {
      this.selectSubMenuHandler = fn;
    }

    getData() {
      return this.data;
    }

  }

  module.exports = WechatMenu;

})(window, document, window['jQuery'], module, exports, require, window['swal'], window['Qiniu'], window['QiniuConfig']);