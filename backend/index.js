const express = require("express");
const { createHandler } = require("graphql-http/lib/use/express");
const { ruruHTML } = require("ruru/server");
const multer = require("multer");
const fs = require("fs");
const path = require("path");

const graphqlSchema = require("./graphql/schemas");
const graphqlResolver = require("./graphql/resolvers");
const sequelize = require("./database");

const User = require("./models/user");
const Post = require("./models/post");

const app = express();

app.use(express.static(path.join(__dirname, "images")));

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

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "images");
  },
  filename: (req, file, cb) => {
    console.log("here");
    cb(null, req.query.id + "-" + file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

app.use(express.json());

app.use(
  multer({ storage: fileStorage, fileFilter: fileFilter }).single("picture")
);

app.post("/savetag", (req, res) => {
  console.log(req.body, "here");
  const img = req.file;
  const tag = req.body.userTag;
  const id = req.query.id;

  User.findByPk(id).then((user) => {
    if (!user) {
      return res.json({ message: "Failed to fetch user" }).status(422);
    }

    user.tag = `@${tag}`;
    if (img) {
      user.picture = id + "-" + img.originalname;
    }

    user.save().then((user) => {
      return res.json({ message: "Success" }).status(201);
    });
  });
});

app.get("/images/:name", (req, res, next) => {
  let name = req.params.name;
  let pathImg = path.join(__dirname, "images", name);
  const file = fs.createReadStream(pathImg);
  res.setHeader("Content-Type", "image");
  file.pipe(res);
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
    const server = app.listen(3000, () =>
      console.log("Server running on port 3000")
    );
    const socket = require("./socket").init(server);

    socket.on("connection", (socket) => {
      console.log("Client connected");
    });
  })
  .catch((err) => console.log(err));
