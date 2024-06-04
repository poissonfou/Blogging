const Sequelize = require("sequelize");
const sequelize = new Sequelize(
  "blogging",
  "root",
  process.env.MYSQL_PASSWORD,
  {
    dialect: "mysql",
    host: "localhost",
  }
);

module.exports = sequelize;
