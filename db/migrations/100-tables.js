'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.createTable('tasks', {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER
        },
        userId: {
          allowNull: false,
          type: Sequelize.INTEGER
        },
        title: {
          type: Sequelize.STRING
        },
        body: {
          allowNull: false,
          type: Sequelize.TEXT
        },
        stared: {
          allowNull: false,
          type: Sequelize.BOOLEAN,
          defaultValue: false,
        },
        createdAt: {
          allowNull: false,
          type: Sequelize.DATE
        },
        updatedAt: {
          allowNull: false,
          type: Sequelize.DATE
        },
      }),
      queryInterface.createTable('users', {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER
        },
        email: {
          allowNull: false,
          type: Sequelize.STRING
        },
        password: {
          allowNull: false,
          type: Sequelize.STRING
        },
        token: {
          allowNull: false,
          type: Sequelize.STRING
        },
      }),
    ])
  },
  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.dropTable('tasks'),
      queryInterface.dropTable('users'),
    ]);
  }
};