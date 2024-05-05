const Sequelize = require("sequelize");
const sequelize = require("../database");

const Post = sequelize.define("post", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  title: Sequelize.STRING,
  abstract: Sequelize.STRING,
  body: Sequelize.STRING,
  images: Sequelize.JSON,
});

module.exports = Post;
