const fs = require('fs');

module.exports = {
  development: {
    dialect: "sqlite",
    storage: "db/dev.sqlite",
  },
  test: {
    dialect: "sqlite",
    storage: "db/test.sqlite",
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
