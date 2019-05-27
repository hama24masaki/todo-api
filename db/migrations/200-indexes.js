'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addIndex('tasks', ['userId'], { indexName: 'tasks_userId_index' }),
      queryInterface.addIndex('users', ['token'], { indexName: 'users_token_index' }),
      queryInterface.addConstraint('users', ['email'], { name: 'users_email_unique', type: 'unique' }),
    ])
  },
  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeIndex('tasks', 'tasks_userId_index'),
      queryInterface.removeIndex('users', 'users_token_index'),
      queryInterface. removeConstraint('users', 'users_email_unique'),
    ]);
  }
};