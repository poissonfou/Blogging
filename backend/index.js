const express = require("express");
const { createHandler } = require("graphql-http/lib/use/express");
const { ruruHTML } = require("ruru/server");

const graphqlSchema = require("./graphql/schemas");
const graphqlResolver = require("./graphql/resolvers");
const sequelize = require("./database");

const User = require("./models/user");
const Post = require("./models/post");

const app = express();

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

app.use((req, res, next) => {
  if (req.id) {
    User.findByPk(req.id)
      .then((user) => {
        req.user = user;
        next();
      })
      .catch((err) => {
        console.log(err);
        next(err);
      });
  }
  next();
});

app.use(
  "/graphql",
  createHandler({
    schema: graphqlSchema,
    rootValue: graphqlResolver,
    formatError(err) {
      if (!err.originalError) {
        return err;
      }
      const data = err.originalError.data;
      const message = err.message || "An error occurred.";
      const code = err.originalError.code || 500;
      return { message, status: code, data };
    },
  })
);

app.get("/", (_req, res) => {
  res.type("html");
  res.end(ruruHTML({ endpoint: "/graphql" }));
});

Post.belongsTo(User, { constraints: true, onDelete: "CASCADE" });
User.hasMany(Post);

sequelize
  .sync()
  .then(() => {
    app.listen(3000, () => console.log("Server running on port 3000"));
  })
  .catch((err) => console.log(err));
