const Sequelize = require("sequelize");
const sequelize = new Sequelize("blogging", "root", "lima1234", {
  dialect: "mysql",
  host: "localhost",
});

module.exports = sequelize;
