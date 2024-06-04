const express = require("express");
const { createHandler } = require("graphql-http/lib/use/express");
const { ruruHTML } = require("ruru/server");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const helmet = require("helmet");
const compression = require("compression");
const morgan = require("morgan");
require("dotenv").config();

const graphqlSchema = require("./graphql/schemas");
const graphqlResolver = require("./graphql/resolvers");
const sequelize = require("./database");
const { authenticateUserHTTP } = require("./auth/auth");

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
    cb(null, req.query.id + "-" + file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg" ||
    file.mimetype === "image/avif"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

app.use(express.json());

const accessLogStream = fs.createWriteStream(
  path.join(__dirname, "access.log"),
  { flags: "a" }
);

app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);
app.use(compression());
app.use(morgan("combined", { stream: accessLogStream }));

app.use(
  multer({ storage: fileStorage, fileFilter: fileFilter }).single("picture")
);

app.post("/updateImage", async (req, res) => {
  const img = req.file;

  const userId = authenticateUserHTTP(req);

  if (!img)
    return res.status(422).json({ message: "Please choose a picture." });

  if (
    img.mimetype !== "image/png" &&
    img.mimetype !== "image/jpg" &&
    img.mimetype !== "image/jpeg" &&
    img.mimetype !== "image/avif"
  ) {
    return res.status(422).json({
      message:
        "Please choose a valid file. Only png, jpg, jpeg and avif are accepted.",
    });
  }

  const user = await User.findByPk(userId);

  if (!user) {
    return res.status(422).json({ message: "Failed to fetch user" });
  }

  let pathImg = path.join(__dirname, "images", user.picture);

  fs.unlink(pathImg, (err) => {
    if (err) {
      return res.status(422).json({ message: "Couldn't update file." });
    }
  });

  user.picture = userId + "-" + img.originalname;

  await user.save();

  const posts = await user.getPosts();

  for (let i = 0; i < posts.length; i++) {
    let p = posts[i].dataValues;

    posts[i].dataValues.tags = JSON.parse(p.tags);
    posts[i].dataValues.images = JSON.parse(p.images);
  }

  const followers = JSON.parse(user.followers);
  const following = JSON.parse(user.following);

  const parseFollowers = followers.map((fol) => JSON.parse(fol));
  const parsedFollowing = following.map((fol) => JSON.parse(fol));

  const newUser = {
    id: user.id,
    name: user.name,
    picture: user.picture,
    posts: posts,
    followers: parseFollowers,
    following: parsedFollowing,
    tag: user.tag,
  };

  return res.status(201).json({ message: "Success", user: newUser });
});

app.post("/savetag", (req, res) => {
  const img = req.file;
  const tag = req.body.userTag.trim();

  const userId = authenticateUserHTTP(req);

  if (!tag.length) {
    return res.status(422).json({ message: "Please enter a user tag." });
  }

  User.findByPk(userId).then((user) => {
    if (!user) {
      return res.status(422).json({ message: "Failed to fetch user" });
    }

    if (user.tag) {
      return res
        .status(422)
        .json({ message: "User has already created a tag." });
    }

    user.tag = `@${tag}`;
    if (img) {
      user.picture = userId + "-" + img.originalname;
    }

    user.save().then((user) => {
      return res.status(201).json({ message: "Success" });
    });
  });
});

app.get("/images/:name", (req, res, next) => {
  let name = req.params.name;
  let pathImg;
  try {
    pathImg = path.join(__dirname, "images", name);
  } catch (e) {
    const error = new Error("Could not find file.");
    error.statusCode = 401;
    throw error;
  }
  const file = fs.createReadStream(pathImg);
  res.setHeader("Content-Type", "image");
  file.pipe(res);
});

const genAI = new GoogleGenerativeAI(process.env.GEMINI_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

app.post("/ai", async (req, res) => {
  authenticateUserHTTP(req);

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
      const code = err.originalError.status || 500;
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
    const server = app.listen(process.env.PORT || 3000, () =>
      console.log("Server running on port" + process.env.PORT || 3000)
    );
    const socket = require("./socket").init(server);

    socket.on("connection", (socket) => {
      console.log("Client connected");
    });
  })
  .catch((err) => console.log(err));
