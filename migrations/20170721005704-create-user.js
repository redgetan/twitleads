'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('users', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE,
      username: { 
        type: Sequelize.STRING,
        unique: true
      },
      email: { 
        type: Sequelize.STRING,
        unique: true
      },
      salt: Sequelize.STRING,
      password_hash: Sequelize.TEXT
    })
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('users')
  }
}
