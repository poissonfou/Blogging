const express = require("express");
const { createHandler } = require("graphql-http/lib/use/express");
const { ruruHTML } = require("ruru/server");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const graphqlSchema = require("./graphql/schemas");
const graphqlResolver = require("./graphql/resolvers");
const sequelize = require("./database");

const User = require("./models/user");
const Post = require("./models/post");
const Comment = require("./models/comment");

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
  const img = req.file;
  const tag = req.body.userTag.trim();
  const id = req.query.id;

  if (!tag.length) {
    return res.status(422).json({ message: "Please enter a user tag." });
  }

  User.findByPk(id).then((user) => {
    if (!user) {
      return res.status(422).json({ message: "Failed to fetch user" });
    }

    user.tag = `@${tag}`;
    if (img) {
      user.picture = id + "-" + img.originalname;
    }

    user.save().then((user) => {
      return res.status(201).json({ message: "Success" });
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

const genAI = new GoogleGenerativeAI("AIzaSyA1FR6TMPcxCJZm6x-Ji6OTKGmoXO0W2Xw");
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

app.post("/ai", async (req, res) => {
  const prompt = req.body.prompt;
  const checkIfEmpty = prompt.trim();

  if (!prompt.length || !checkIfEmpty.length) {
    return res.status(422).json({ message: "Please provide a prompt." });
  }

  const result = await model.generateContent(prompt);

  if (!result) {
    return res.status(500).json({ message: "Couldn't generate response." });
  }

  const response = result.response;
  const text = response.text();

  res.status(200).json({ response: text });
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

Comment.belongsTo(Post, { constraints: true, onDelete: "CASCADE" });
Post.hasMany(Comment);

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
