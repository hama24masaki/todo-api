const fs = require('fs');
const debug = require('debug')//('sequelize:db');

module.exports = {
  development: {
    dialect: "sqlite",
    storage: "db/dev.sqlite",
    logging: (args) => {
      debug(args)
    }
  },
  test: {
    dialect: "sqlite",
    storage: "db/test.sqlite",
    logging: (args) => {
      debug(args)
    }
  },
//   production: {
//     username: process.env.DB_USERNAME,
//     password: process.env.DB_PASSWORD,
//     database: process.env.DB_NAME,
//     host: process.env.DB_HOSTNAME,
//     dialect: 'mysql',
//     // dialectOptions: {
//     //   ssl: {
//     //     ca: fs.readFileSync(__dirname + '/mysql-ca-master.crt')
//     //   }
//     // }
//   }
};
