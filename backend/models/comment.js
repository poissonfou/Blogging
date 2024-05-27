const Sequelize = require("sequelize");
const sequelize = require("../database");

const Comment = sequelize.define("comment", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  content: Sequelize.STRING,
  author: Sequelize.INTEGER,
  likes: Sequelize.STRING,
  dislikes: Sequelize.STRING,
});

module.exports = Comment;
