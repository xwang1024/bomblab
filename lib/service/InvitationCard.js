'use strict';

const fs      = require('fs');
const path    = require('path');
const async   = require('async');
const request = require('request');
const debug   = require('debug')('InvitationCard');
const EventEmitter = require('events');
const Canvas  = require('canvas'),
      Image   = Canvas.Image;
const Wechat  = require('./Wechat');
const Mongo   = require('./Mongo');
const DB      = Mongo.getClient();
const Subscriber     = DB.models.Subscriber;
const InvitationTask = DB.models.InvitationTask;
const InvitationCard = DB.models.InvitationCard;

exports.sendCard = function(openId, taskId) {
  debug('Card Request: ' + openId + " " + taskId);
  const workflow = new EventEmitter();
  const subscriber = {};
  const task = {};
  const card = {};
  const assetPath = {};

  // 判断邀请功能状态
  workflow.on('checkFeatureStatus', () => {
    debug('Event: checkFeatureStatus');
    InvitationTask.findById(taskId).exec((err, doc) => {
      if(err) return workflow.emit('error', err); // 错误
      if(!doc || doc.status !== 'OPEN') return Wechat.sendText(openId, '邀请任务暂未开放~');
      Object.assign(task, doc.toJSON());
      workflow.emit('getSubscriberInfo'); // 获取用户信息
    });
  });

  // 获取用户信息
  workflow.on('getSubscriberInfo', () => {
    debug('Event: getSubscriberInfo');
    Wechat.getSubscriberInfo(openId).then((info) => {
      if(!info) return workflow.emit('error', new Error('Cannot find subscriber info')); // 错误
      Object.assign(subscriber, info);
      workflow.emit('getCardRecord'); // 获取邀请卡记录
    }).catch((err) => {
      return workflow.emit('error', err); // 错误
    })
  });

  // 获取邀请卡记录
  workflow.on('getCardRecord', () => {
    debug('Event: getCardRecord');
    InvitationCard.findOne({ openId, invitationTask: taskId }).exec((err, doc) => {
      if(err) return workflow.emit('error', err);
      if(!doc) return workflow.emit('genNewCardRecord'); // 生成邀请卡记录
      Object.assign(card, doc.toJSON());
      workflow.emit('resolveAssetPath'); // 生成路径参数
    });
  });

  // 生成邀请卡记录
  workflow.on('genNewCardRecord', () => {
    debug('Event: genNewCardRecord');
    const newCard = new InvitationCard({
      invitationTask: taskId,
      openId: openId
    });
    newCard.save((err) => {
      if(err) return workflow.emit('err', err);
      Object.assign(card, newCard.toJSON());
      workflow.emit('resolveAssetPath'); // 生成路径参数
    })
  });

  // 生成路径参数
  workflow.on('resolveAssetPath', () => {
    debug('Event: resolveAssetPath');
    assetPath.qrCode         = path.resolve(__dirname, '../../static_files/qrCode/' + card._id + '.png');
    assetPath.avatar         = path.resolve(__dirname, '../../static_files/avatar/' + openId + '.png');
    assetPath.invitationCard = path.resolve(__dirname, '../../static_files/invitationCard/' + card._id + '.png');
    workflow.emit('checkQRFile'); // 检查 QR 文件
  });

  // 申请QR，下载QR
  workflow.on('downloadQR', () => {
    debug('Event: downloadQR');
    Wechat.getTempQRCodeTicket(card._id).then((res) => {
      card.qrTicket = res.ticket;
      if(!card.qrTicket) return workflow.emit('error', new Error('未获得ticket: ' + res)); // 未得到 ticket
      Wechat.getQRCodeImage(card.qrTicket).then((qrReq) => {
        let qrOutStream = fs.createWriteStream(assetPath.qrCode);
        qrOutStream.on('error', function (err) {
          workflow.emit('error', err);
        });
        qrOutStream.on('finish', function () {
          workflow.emit('downloadAvatar'); // 下载头像文件
        });
        qrReq.pipe(qrOutStream);
      }).catch((err) => { // 下载 QR 异常
        return workflow.emit('error', new Error('未获得ticket: ' + res));
      });
    }).catch((err) => { // 获取 ticket 异常
      return workflow.emit('error', new Error('未获得ticket: ' + res));
    });
  });

  // 下载头像文件
  workflow.on('downloadAvatar', () => {
    debug('Event: downloadAvatar');
    let avatarOutStream = fs.createWriteStream(assetPath.avatar);
    avatarOutStream.on('error', function (err) {
      workflow.emit('error', err);
    });
    avatarOutStream.on('finish', function () {
      workflow.emit('generateCard');  // 生成邀请卡
    });
    request(subscriber.headimgurl).pipe(avatarOutStream);
  });

  // 生成邀请卡
  workflow.on('generateCard', () => {
    debug('Event: generateCard');
    // 生成 cardSetting
    let cardSetting = {};
    task.cardSetting.objects.forEach(function(o) {
      if(o.fillRule === 'background') {
        cardSetting.background = o;
      }
      if(o.type === 'rect') {
        cardSetting.qrCode = o;
      }
      if(o.type === 'circle') {
        cardSetting.avatar = o;
      }
      if(o.type === 'text') {
        cardSetting.text = o;
      }
    });
    // canvas 大小设定
    let canvas = new Canvas(cardSetting.background.width, cardSetting.background.height);
    let ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = true

    // 绘制 background
    let bg = new Image;
    bg.src = cardSetting.background.src;
    ctx.drawImage(bg, 0, 0);

    // 绘制 qr
    let qr = new Image;
    qr.src = fs.readFileSync(assetPath.qrCode);
    ctx.drawImage(qr, 
      cardSetting.qrCode.left / cardSetting.background.scaleX + 2, 
      cardSetting.qrCode.top / cardSetting.background.scaleY + 2, 
      cardSetting.qrCode.width * cardSetting.qrCode.scaleX / cardSetting.background.scaleX, 
      cardSetting.qrCode.height * cardSetting.qrCode.scaleY / cardSetting.background.scaleY
    );

    if(cardSetting.avatar) {
      // 绘制 avatar
      let avatar = new Image;
      avatar.src = fs.readFileSync(assetPath.avatar);
      let avatarTop = cardSetting.avatar.top / cardSetting.background.scaleY;
      let avatarLeft = cardSetting.avatar.left / cardSetting.background.scaleX;
      let avatarRadius = cardSetting.avatar.radius * cardSetting.avatar.scaleX / cardSetting.background.scaleX;
      ctx.save();
      ctx.beginPath();
      ctx.arc(avatarLeft+avatarRadius, avatarTop+avatarRadius, avatarRadius, 0, Math.PI * 2, false);
      ctx.clip();
      ctx.drawImage(avatar, avatarLeft, avatarTop, avatarRadius*2, avatarRadius*2);
      ctx.restore();
    }
    
    if(cardSetting.text) {
      // 绘制 nickname
      let textTop = cardSetting.text.top / cardSetting.background.scaleY;
      let textLeft = cardSetting.text.left / cardSetting.background.scaleX;
      let fontSize = cardSetting.text.fontSize;
      let textFill = cardSetting.text.fill;
      let text = (subscriber.nickname || "");
      if(text.length > 10) {
        text = text.substring(0, 10) + '...';
      }
      ctx.textBaseline = "top";
      ctx.font = fontSize / cardSetting.background.scaleX + 'px Arial,文泉驿微米黑';
      ctx.fillStyle = textFill;
      ctx.fillText(text, textLeft, textTop);
    }

    // 存邀请卡文件，更新数据库
    let invitationCardStream = fs.createWriteStream(assetPath.invitationCard);
    invitationCardStream.on('error', function (err) {
      workflow.emit('error', err);
    });
    invitationCardStream.on('finish', function () {
      InvitationCard.findOneAndUpdate({ _id: card._id }, { 
        qrTicket: card.qrTicket,
        nickname: subscriber.nickname,
        headImgUrl: subscriber.headimgurl,
        updatedAt: new Date()
      }, { upsert: 1 }).exec((err) => {
        if(err) return workflow.emit('error', err);
        workflow.emit('uploadAndSendCard');  // 上传并回复邀请卡
      });
    });
    canvas.pngStream().pipe(invitationCardStream);
  });

  // 上传并回复邀请卡
  workflow.on('uploadAndSendCard', () => {
    debug('Event: uploadAndSendCard');
    Wechat.uploadTempMaterial('image', assetPath.invitationCard).then((info) => {
      if(task.introduction) Wechat.sendText(openId, task.introduction);
      Wechat.sendImage(openId, info.media_id);
    }).catch((err) => {
      workflow.emit('error', err);
    });
  });

  // 检查 QR 文件
  workflow.on('checkQRFile', () => {
    debug('Event: checkQRFile');
    if(fs.existsSync(assetPath.qrCode)) {
      workflow.emit('isAvatarChanged'); // 检查头像是否变更
    } else {
      workflow.emit('downloadQR'); // 申请QR，下载QR
    }
  });

  // 检查头像是否变更
  workflow.on('isAvatarChanged', () => {
    debug('Event: isAvatarChanged');
    if(subscriber.headimgurl == card.headImgUrl) {
      workflow.emit('checkAvatarFile'); // 检查头像文件
    } else {
      workflow.emit('downloadAvatar'); // 下载头像文件
    }
  });

  // 检查头像文件
  workflow.on('checkAvatarFile', () => {
    debug('Event: checkAvatarFile');
    if(fs.existsSync(assetPath.avatar)) {
      workflow.emit('isNicknameChanged'); // 检查昵称是否变更
    } else {
      workflow.emit('isAvatarChanged'); // 检查头像是否变更
    }
  });

  // 检查昵称是否变更
  workflow.on('isNicknameChanged', () => {
    debug('Event: isNicknameChanged');
    if(subscriber.nickname == card.nickname) {
      workflow.emit('isSettingChanged'); // 检查配置是否变更
    } else {
      workflow.emit('generateCard'); // 生成邀请卡
    }
  });

  // 检查配置是否变更
  workflow.on('isSettingChanged', () => {
    debug('Event: isSettingChanged');
    if(task.updatedAt <= card.updatedAt) { // 配置较老
      workflow.emit('checkCardFile'); // 检查邀请卡文件
    } else {
      workflow.emit('generateCard'); // 生成邀请卡
    }
  });

  // 检查邀请卡文件
  workflow.on('checkCardFile', () => {
    debug('Event: checkCardFile');
    if(fs.existsSync(assetPath.invitationCard)) {
      workflow.emit('uploadAndSendCard'); // 上传并回复邀请卡
    } else {
      workflow.emit('generateCard'); // 生成邀请卡
    }
  });

  // 错误事件
  workflow.on('error', (err, wechatMessage) => {
    debug('Event: error');
    if(err) {
      console.error(err, err.stack);
    } else {
      console.error('Undefined Error Event');
    }
    Wechat.sendText(openId, wechatMessage || '服务忙，请稍后再试~');
  });

  workflow.emit('checkFeatureStatus');
}