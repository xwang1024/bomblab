'use strict';

(function(window, document, $, module, exports, require, swal, Qiniu, QiniuConfig){
  class ReplyQueue {
    constructor(ctnSelector) {
      this.$element = $(ctnSelector);
    }

    // 初始化自定义菜单
    init(data) {
      if(!data) {
        console.log('self-inited wechat menu')
        data = []
      }
      this.data = data;
      this._render();
    }

    _render() {
      console.log(this.data)
      $('#detail-area').html(`
        ${this.data.messageGroups.map((messageGroup, index) => (
          `<div class="panel panel-default">
            <div class="panel-heading">
              消息组
              <button class="btn btn-xs btn-primary pull-right" name="addImageBtn">增加图片</button>
              <button class="btn btn-xs btn-primary pull-right mr-sm" name="addTextBtn">增加文本</button>
              <button class="btn btn-xs btn-default pull-right mr-sm" name="backwardGroupBtn">下移</button>
              <button class="btn btn-xs btn-default pull-right mr-sm" name="forwardGroupBtn">上移</button>
            </div>
            <div class="panel-body pv0">
              <ul class="message-bubble-list">
                ${messageGroup ? messageGroup.map((message) => {
                  if(message.type === 'text') {
                    return `
                      <li>
                        <span>${message.content}</span>
                        <div>
                          <button class="btn btn-danger btn-xs pull-right" name="deleteMessageBtn">删除</button>
                          <button class="btn btn-default btn-xs pull-right mr-sm" name="backwardMessageBtn">下移</button>
                          <button class="btn btn-default btn-xs pull-right mr-sm" name="forwardMessageBtn">上移</button>
                        </div>
                      </li>`
                  }
                  if(message.type === 'image') {
                    return `
                      <li>
                        <span class="fa fa-picture-o"></span>
                        <div>
                          <button class="btn btn-danger btn-xs pull-right" name="deleteMessageBtn">删除</button>
                          <button class="btn btn-default btn-xs pull-right mr-sm" name="previewMessageBtn">预览</button>
                          <button class="btn btn-default btn-xs pull-right mr-sm" name="forwardMessageBtn">下移</button>
                          <button class="btn btn-default btn-xs pull-right mr-sm" name="backwardMessageBtn">上移</button>
                        </div>
                      </li>`
                  }
                }).join('') : ''}
              </ul>
            </div>
          </div>`
        )).join('')}
        <button class="btn btn-green" name="addGroupBtn" style="width: 100%">增加消息组</button>
        <button class="btn btn-primary mt" name="saveGroupBtn" style="width: 100%">保存消息组</button>
      `);
      this._bind();
    }

    _bind() {
      let vm = this;
      this.$element.find('[name=addGroupBtn]').unbind().on('click', function(e) {
        vm.data.messageGroups.push([]);
        vm._render();
      });
      this.$element.find('[name=forwardGroupBtn]').unbind().on('click', function(e) {
        let messageGroupIndex = vm.$element.find('.panel').index($(this).parents('.panel'));
        vm.moveGroup(messageGroupIndex, -1);
      });
      this.$element.find('[name=backwardGroupBtn]').unbind().on('click', function(e) {
        console.log(vm.$element.find('.panel'))
        console.log($(this).parents('.panel'))
        let messageGroupIndex = vm.$element.find('.panel').index($(this).parents('.panel'));
        vm.moveGroup(messageGroupIndex, 1);
      });
      this.$element.find('[name=addTextBtn]').unbind().on('click', function(e) {
        let messageGroupIndex = vm.$element.find('.panel').index($(this).parents('.panel'));
        $(this).parents('.panel').find('.message-bubble-list').append(`
          <li>
            <textarea class="form-control" name="message" placeholder="请输入消息内容"></textarea>
            <div>
              <button class="btn btn-default btn-xs pull-right" name="confirmTextBtn">确定</button>
              <button class="btn btn-default btn-xs pull-right mr-sm" name="cancelBtn">取消</button>
            </div>
          </li>
        `);
        // 禁止无关按钮触发
        vm._disableBtnOnEditing();
        vm.$element.find('[name=confirmTextBtn]').unbind().on('click', function() {
          let text = vm.$element.find('textarea[name=message]').val();
          vm.data.messageGroups[messageGroupIndex].push({
            type: 'text',
            content: text
          });
          vm._render();
        });
        vm.$element.find('[name=cancelBtn]').unbind().on('click', function() {
          vm._render();
        });
      });
      this.$element.find('[name=addImageBtn]').unbind().on('click', function(e) {
        let messageGroupIndex = vm.$element.find('.panel').index($(this).parents('.panel'));
        $(this).parents('.panel').find('.message-bubble-list').append(`
          <li>
            <input type="text" class="form-control" name="mediaId" placeholder="请输入mediaId">
            <div>
              <button class="btn btn-default btn-xs pull-right" name="confirmImageBtn">确定</button>
              <button class="btn btn-default btn-xs pull-right mr-sm" name="cancelBtn">取消</button>
            </div>
          </li>
        `);
        // 禁止无关按钮触发
        vm._disableBtnOnEditing();
        vm.$element.find('[name=confirmImageBtn]').unbind().on('click', function() {
          let mediaId = vm.$element.find('input[name=mediaId]').val();
          vm.data.messageGroups[messageGroupIndex].push({
            type: 'image',
            mediaId: mediaId
          });
          vm._render();
        });
        vm.$element.find('[name=cancelBtn]').unbind().on('click', function() {
          vm._render();
        });
      });
      this.$element.find('[name=forwardMessageBtn]').unbind().on('click', function(e) {
        let messageGroupIndex = vm.$element.find('.panel').index($(this).parents('.panel'));
        let messageIndex = $(this).parents('.message-bubble-list').find('li').index($(this).parents('li'));
        vm.moveMessage(messageGroupIndex, messageIndex, -1);
      });
      this.$element.find('[name=backwardMessageBtn]').unbind().on('click', function(e) {
        let messageGroupIndex = vm.$element.find('.panel').index($(this).parents('.panel'));
        let messageIndex = $(this).parents('.message-bubble-list').find('li').index($(this).parents('li'));
        vm.moveMessage(messageGroupIndex, messageIndex, 1);
      });
      this.$element.find('[name=saveGroupBtn]').unbind().on('click', function(e) {
        console.log(vm.data);
      });
    }
    
    _disableBtnOnEditing() {
      this.$element.find('[name=addTextBtn]').prop('disabled', true);
      this.$element.find('[name=addImageBtn]').prop('disabled', true);
      this.$element.find('[name=forwardGroupBtn]').prop('disabled', true);
      this.$element.find('[name=backwardGroupBtn]').prop('disabled', true);
      this.$element.find('[name=forwardMessageBtn]').prop('disabled', true);
      this.$element.find('[name=backwardMessageBtn]').prop('disabled', true);
      this.$element.find('[name=modifyMessageBtn]').prop('disabled', true);
      this.$element.find('[name=deleteMessageBtn]').prop('disabled', true);
      this.$element.find('[name=addGroupBtn]').prop('disabled', true);
      this.$element.find('[name=saveGroupBtn]').prop('disabled', true);
    }

    _enableBtnOnEditing() {
      this.$element.find('[name=addTextBtn]').prop('disabled', false);
      this.$element.find('[name=addImageBtn]').prop('disabled', false);
      this.$element.find('[name=forwardGroupBtn]').prop('disabled', false);
      this.$element.find('[name=backwardGroupBtn]').prop('disabled', false);
      this.$element.find('[name=forwardMessageBtn]').prop('disabled', false);
      this.$element.find('[name=backwardMessageBtn]').prop('disabled', false);
      this.$element.find('[name=modifyMessageBtn]').prop('disabled', false);
      this.$element.find('[name=deleteMessageBtn]').prop('disabled', false);
      this.$element.find('[name=addGroupBtn]').prop('disabled', false);
      this.$element.find('[name=saveGroupBtn]').prop('disabled', false);
    }

    moveGroup(index, offset) {
      let toIndex = index + offset;
      (toIndex < 0) && (toIndex = 0);
      (toIndex > this.data.messageGroups.length-1) && (toIndex = this.data.messageGroups.length-1);
      this._arrayMove(this.data.messageGroups, index, toIndex);
      this._render();
    }

    moveMessage(index, subIndex, offset) {
      console.log(this.data.messageGroups[index], index, subIndex, offset)
      let messageGroup = this.data.messageGroups[index];
      let toIndex = subIndex + offset;
      (toIndex < 0) && (toIndex = 0);
      (toIndex > messageGroup.length-1) && (toIndex = messageGroup.length-1);
      console.log(this.data.messageGroups[index], index, subIndex, toIndex)
      this._arrayMove(this.data.messageGroups[index], subIndex, toIndex);
      this._render();
    }

    _arrayMove(arr, fromIndex, toIndex) {
      var element = arr[fromIndex];
      arr.splice(fromIndex, 1);
      arr.splice(toIndex, 0, element);
    }

    getData() {
      return this.data;
    }

  }

  module.exports = ReplyQueue;

})(window, document, window['jQuery'], module, exports, require, window['swal'], window['Qiniu'], window['QiniuConfig']);