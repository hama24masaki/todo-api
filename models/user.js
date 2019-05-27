'use strict';

// const Sequelize = require('sequelize');
const NotFoundError = require("../utils/not_found_error");

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    // id: DataTypes.INTEGER,
    email: DataTypes.STRING,
    password: DataTypes.STRING,
    token: DataTypes.STRING,
  }, {
    timestamps: false,
    paranoid: false,
    version: false,
  });

  User.associate = function (models) {
    // associations can be defined here
  };

  
  User.getByToken = function(token) {
    return this.findOne({ where: { token: token } })
    .then(m => {
      if (m)
        return m
      else
        throw new NotFoundError(`User not found. token = ${token}`);
    })
  }

  return User;
};
