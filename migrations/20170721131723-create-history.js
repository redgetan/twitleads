'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.createTable('histories', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE,
      user_id: { 
        type: Sequelize.INTEGER,
        references: {
          model: 'users',
          key: 'id'
        },
      },
      search: Sequelize.TEXT,
      result: Sequelize.TEXT
    })
  },

  down: function (queryInterface, Sequelize) {
    return queryInterface.dropTable('histories')
  }
};
