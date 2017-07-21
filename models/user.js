const crypto = require('crypto')

module.exports = function(sequelize, DataTypes) {

  const User = sequelize.define('User', {
    username: { 
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
      validate: {
        is: { 
          args: /^[a-z_]+$/i,
          msg: "Username can only contain alphabets, numbers, and underscore. "
        },
        notEmpty: { args: true, msg: "Username can't be blank" }
      }
    },
    email: { 
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
      validate: { 
        isEmail: { args: true, msg: "Email is not valid email" },
        notEmpty: { args: true, msg: "Email can't be blank" }
      }
    },
    password: {
      type: DataTypes.VIRTUAL,
      set: function (password) {
         const salt = crypto.randomBytes(16).toString('hex')
         const hash = crypto.pbkdf2Sync(password, salt, 10000, 256, 'sha256').toString('hex')

         this.setDataValue('salt', salt);
         this.setDataValue('password', password);
         this.setDataValue('password_hash', hash);
      },
      validate: {
        notEmpty: { args: true, msg: "Password can't be blank" }
      }
    },
    password_hash: DataTypes.STRING,
    salt: DataTypes.STRING,
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE
  }, {
    tableName: "users",
    indexes: [{unique: true, fields: ['username', 'email']}]
  })

  User.prototype.validPassword = function(password) {
    const hash = crypto.pbkdf2Sync(password, this.salt, 10000, 256, 'sha256').toString('hex')
    return this.password_hash === hash
  }
  
  return User

}
