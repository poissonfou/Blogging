const Sequelize = require("sequelize");
const sequelize = require("../database");

const User = sequelize.define("user", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  name: Sequelize.STRING,
  email: Sequelize.STRING,
  password: Sequelize.STRING,
  picture: Sequelize.STRING,
  tag: Sequelize.STRING,
  followers: Sequelize.STRING,
  following: Sequelize.STRING,
});

module.exports = User;
