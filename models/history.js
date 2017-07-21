const User = require('./user')

module.exports = function(sequelize, DataTypes) {

  const History = sequelize.define('History', {
    user_id  : DataTypes.INTEGER,
    search   : DataTypes.TEXT,
    result   : DataTypes.TEXT,
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE
  }, {
    tableName: "histories",
    charset: 'utf8',
    collate: 'utf8_unicode_ci'
  })
  
  return History

}
