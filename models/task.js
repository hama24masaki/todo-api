'use strict';

const Sequelize = require('sequelize');
const NotFoundError = require("../utils/not_found_error");

module.exports = (sequelize, DataTypes) => {
  const Task = sequelize.define('Task', {
    userId: DataTypes.STRING,
    title: DataTypes.STRING,
    body: DataTypes.TEXT,
    stared: DataTypes.BOOLEAN,
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  }, {
    timestamps: false,
    paranoid: false,
    version: false,
  });

  Task.associate = function (models) {
    // associations can be defined here
  };

  Task.getById = function(userId, taskId, throwErrorWhenNotFound = true) {
    return this.findByPk(taskId)
    .then(ret => {
      if (ret && ret.userId === userId) {
        return ret
      } else {
        if (throwErrorWhenNotFound)
          throw new NotFoundError(`Model not found. id = ${taskId}`);
        else
          return null;
      }
    })
  }

  Task.searchWithQuery = function(userId, query, sort, limit, offset, returnWithModel = false) {  
    const sortParams = (sort || "").split(",");
    let opt;
    if (query) {
      opt = {
        where: {
          userId: userId,
          [Sequelize.Op.or]: [
            { title: { [Sequelize.Op.like]: `%${query}%` } },
            { body: { [Sequelize.Op.like]: `%${query}%` } }
          ]
        }
      }
    } else {
      opt = {
        where: {
          userId: userId,
        }
      }
    }

    if (limit)
      opt = Object.assign(opt, { limit: limit })
    
      if (offset)
      opt = Object.assign(opt, { offset: offset });

    return this.findAll(opt)
    .then(ret => {
      return returnWithModel ? ret : ret.map(m => m.dataValues);
    });
  }


  Task.prototype.toJsonResult = function() {
    return this.dataValues; // TODO 
  }

  return Task;
};
