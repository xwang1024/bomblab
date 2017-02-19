'use strict';

exports = module.exports = function (app, mongoose) {
  var userSchema = new mongoose.Schema({
    username: { type: String },
    password: String,
    role: { type: String, default: 'normal' },
    isActive: String,
    timeCreated: { type: Date, default: Date.now },
    isDeleted: Boolean,
  });
  userSchema.methods.canPlayRoleOf = function(role) {
    return (role === this.role)
  }
  userSchema.methods.defaultReturnUrl = function() {
    var returnUrl = '/admin/dashboard';
    return returnUrl;
  };
  userSchema.methods.getVO = function() {
    return {
      id: this._id,
      username: this.username,
      role: this.role,
      isActive: this.isActive,
      timeCreated: this.timeCreated
    };
  };
  userSchema.statics.encryptPassword = function(password, done) {
    var bcrypt = require('bcryptjs');
    bcrypt.genSalt(10, function(err, salt) {
      if (err) {
        return done(err);
      }

      bcrypt.hash(password, salt, function(err, hash) {
        done(err, hash);
      });
    });
  };
  userSchema.statics.validatePassword = function(password, hash, done) {
    var bcrypt = require('bcryptjs');
    bcrypt.compare(password, hash, function(err, res) {
      done(err, res);
    });
  };
  userSchema.index({ username: 1 }, { unique: true });
  userSchema.index({ isDeleted: 1 });
  app.db.model('User', userSchema);

  // 检查是否有root用户
  app.db.models.User.findOne({ username: 'root' }, function(err, user) {
    if (!user) {
      app.db.models.User.encryptPassword('root', function(err, hash) {
        if (err) {
          console.log('[Error on Create Root User]', err);
          return;
        }

        var fieldsToSet = {
          isActive: 'yes',
          username: 'root',
          role    : 'admin',
          password: hash
        };
        app.db.models.User.create(fieldsToSet, function(err, user) {
          if (err) {
            console.log('[Error on Create Root User]', err);
            return;
          }
          console.log('Create Root User...OK')
        });
      });
    }
  });
};