const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/user");
const Post = require("../models/post");
const io = require("../socket");

module.exports = {
  login: async ({ email, password }) => {
    let errorMessage;

    if (!validator.isEmail(email)) {
      errorMessage = "Invalid email.";
    }

    if (validator.isEmpty(password) || password.length < 5) {
      errorMessage = "Invalid password.";
    }

    if (errorMessage) {
      const error = new Error(errorMessage);
      error.status = 422;
      throw error;
    }

    const user = await User.findAll({
      where: {
        email: email,
      },
    });

    if (!user) {
      const error = new Error(
        "An user with this email doesn't exist. Please signup."
      );
      error.status = 422;
      throw error;
    }

    const isEqual = await bcrypt.compare(password, user[0].dataValues.password);

    if (!isEqual) {
      const error = new Error("Password is incorrect");
      error.code = 401;
      throw error;
    }

    const token = jwt.sign(
      {
        userId: user[0].dataValues.id.toString(),
        email: user.email,
      },
      "bloggingsecretyeehaaw",
      { expiresIn: "3h" }
    );

    return { token, id: user[0].dataValues.id };
  },
  signup: async ({ signupInput }, req) => {
    let errorMessage;

    if (!validator.isEmail(signupInput.email)) {
      errorMessage = "Invalid email.";
    }

    if (
      validator.isEmpty(signupInput.password) ||
      signupInput.password.length < 5
    ) {
      errorMessage = "Password should be at least 6 digits";
    }

    if (signupInput.password !== signupInput.confirm) {
      errorMessage = "Password have to be equal.";
    }

    if (validator.isEmpty(signupInput.name)) {
      errorMessage = "Please enter your name";
    }

    if (errorMessage) {
      const error = new Error(errorMessage);
      error.status = 422;
      throw error;
    }

    const user = await User.findAll({
      where: {
        email: signupInput.email,
      },
    });

    if (user.length) {
      const error = new Error("An user with this email already exists.");
      error.status = 422;
      throw error;
    }

    const password = await bcrypt.hash(signupInput.password, 12);

    const newUser = await User.create({
      name: signupInput.name,
      email: signupInput.email,
      password: password,
      followers: JSON.stringify([]),
      following: JSON.stringify([]),
    });

    if (!newUser) {
      const error = new Error("Could not create user, please try again.");
      error.status = 500;
      throw error;
    }

    const token = jwt.sign(
      {
        userId: newUser.id.toString(),
        email: newUser.email,
      },
      "bloggingsecretyeehaaw",
      { expiresIn: "3h" }
    );

    return { token, id: newUser.id };
  },
  update: async ({ name, password, confirm, id }) => {
    const nameVal = name.trim();
    const passwordVal = password.trim();
    const confirmVal = confirm.trim();

    if (!nameVal.length && !passwordVal.length) return;

    const user = await User.findByPk(id);

    if (!user) {
      const error = new Error("User not found!");
      error.status = 422;
      throw error;
    }

    if (nameVal.length) {
      user.name = name;
    }

    if (passwordVal.length) {
      if (passwordVal.length < 6) {
        const error = new Error("Password needs to be at least six digits.");
        error.status = 422;
        throw error;
      }

      if (passwordVal !== confirmVal) {
        const error = new Error("Passwords don't match.");
        error.status = 422;
        throw error;
      }
      const newPassword = await bcrypt.hash(passwordVal, 12);
      user.password = newPassword;
    }

    await user.save();

    return { message: "Success" };
  },
  getUser: async ({ id }) => {
    if (id < 0 || typeof id !== "number") {
      const error = new Error("Invalid parameter provided.");
      error.status = 500;
      throw error;
    }

    const user = await User.findByPk(id);

    if (!user) {
      const error = new Error("No user found.");
      error.status = 500;
      throw error;
    }

    const posts = await user.getPosts();

    for (let i = 0; i < posts.length; i++) {
      let p = posts[i].dataValues;

      posts[i].dataValues.tags = JSON.parse(p.tags);
      posts[i].dataValues.images = JSON.parse(p.images);
    }

    return {
      id: user.id,
      name: user.name,
      picture: user.picture,
      posts: posts,
      followers: JSON.parse(user.followers),
      following: JSON.parse(user.following),
      tag: user.tag,
    };
  },
  getPost: async ({ postId, authorId }) => {
    if (postId < 0 || typeof postId !== "number") {
      const error = new Error("Invalid parameter provided.");
      error.status = 500;
      throw error;
    }

    const user = await User.findByPk(authorId);

    if (!user) {
      const error = new Error("No user found.");
      error.status = 500;
      throw error;
    }

    const posts = await user.getPosts();
    let selectedPost = null;

    for (let i = 0; i < posts.length; i++) {
      if (posts[i].dataValues.id == postId) {
        selectedPost = posts[i].dataValues;
        break;
      }
    }

    if (!selectedPost) {
      const error = new Error("Post not found.");
      error.status = 500;
      throw error;
    }

    selectedPost.tags = JSON.parse(selectedPost.tags);

    return { author: user, ...selectedPost };
  },
  search: async ({ query }) => {
    const results = await User.findAll({
      where: {
        name: query,
      },
    });

    if (!results.length) {
      return { message: "No results found" };
    }

    const response = [];

    for (let i = 0; i < results.length; i++) {
      const posts = await results[i].getPosts();
      posts.map((p) => {
        p.dataValues.tags = JSON.parse(p.dataValues.tags);
        p.dataValues.images = JSON.parse(p.dataValues.images);
      });
      const userData = results[i].dataValues;
      response.push({
        id: userData.id,
        name: userData.name,
        picture: userData.picture,
        posts: posts,
        followers: JSON.parse(userData.followers),
        following: JSON.parse(userData.following),
        tag: userData.tag,
      });
    }

    return response;
  },
  addPost: async ({ postInput }) => {
    const title = postInput.title;
    const abstract = postInput.abstract;
    const body = postInput.body;
    const tags = postInput.tags;
    const images = postInput.images;
    const id = postInput.userId;

    if (!title.length) {
      console.log("Please add a title.");
      return;
    }

    if (!body.length) {
      console.log("Please add content to your post.");
      return;
    }

    if (!tags.length) {
      console.log("Please add at least one tag.");
      return;
    }

    const user = await User.findByPk(id);

    if (!user) {
      console.log("Error fetching user.");
      return;
    }

    const post = await user.createPost({
      title,
      abstract,
      body,
      tags: JSON.stringify(tags),
      images: JSON.stringify(images),
    });

    if (!post) {
      throw new Error("Coulnd't save post.");
    }

    io.getIO().emit("post", {
      action: "post",
      user: {
        name: user.name,
        picture: user.picture,
        id: user.id,
        postId: post.id,
        postTitle: post.title,
      },
    });

    return {
      message: "Success",
      data: {
        title,
        abstract,
        body,
        tags,
        images,
        id: post.dataValues.id,
        createdAt: post.dataValues.createdAt,
        updatedAt: post.dataValues.updatedAt,
      },
    };
  },
  editPost: async ({ postInput }) => {
    const title = postInput.title;
    const abstract = postInput.abstract;
    const body = postInput.body;
    const tags = postInput.tags;
    const images = postInput.images;
    const postId = postInput.postId;

    if (!title.length) {
      console.log("Please add a title.");
      return;
    }

    if (!body.length) {
      console.log("Please add content to your post.");
      return;
    }

    if (!tags.length) {
      console.log("Please add at least one tag.");
      return;
    }

    const post = await Post.findByPk(postId);

    if (!post) {
      console.log("Unable to fetch post. Please try again.");
      return;
    }

    post.title = title;
    post.abstract = abstract;
    post.body = body;
    post.images = JSON.stringify(images);
    post.tags = JSON.stringify(tags);
    await post.save();

    return {
      message: "Success",
      data: {
        id: post.id,
        title: post.title,
        abstract: post.abstract,
        body: post.body,
        images: images,
        tags: tags,
      },
    };
  },
  deletePost: async ({ id }) => {
    const post = await Post.findByPk(id);

    if (!post) {
      throw new Error("Post not found.");
    }

    await post.destroy();

    return { message: "Success" };
  },
  follow: async ({ id, userId }) => {
    const user = await User.findByPk(userId);

    if (!user) {
      return { message: "User not found." };
    }

    user.following = JSON.parse(user.following);
    if (user.following.includes(id))
      return { message: "User already follows this account" };
    user.following.push(id);
    user.following = JSON.stringify(user.following);
    await user.save();

    const userFollowed = await User.findByPk(id);

    if (!userFollowed) {
      return { message: "User being followed not found." };
    }

    userFollowed.followers = JSON.parse(userFollowed.followers);
    userFollowed.followers.push(userId);
    userFollowed.followers = JSON.stringify(userFollowed.followers);
    await userFollowed.save();

    io.getIO().emit("follow", {
      action: "follow",
      follower: { name: user.name, picture: user.picture, id: user.id },
      following: userFollowed.tag,
    });

    return { message: "Following added." };
  },
  unfollow: async ({ id, userId }) => {
    const user = await User.findByPk(userId);

    if (!user) {
      return { message: "User not found." };
    }

    user.following = JSON.parse(user.following);
    const idx = user.following.indexOf(id);
    if (idx == -1) return { message: "Unfollowed account not found." };
    user.following.splice(idx, 1);
    user.following = JSON.stringify(user.following);
    await user.save();

    const userUnfollowed = await User.findByPk(id);

    if (!userUnfollowed) {
      return { message: "User not found." };
    }

    userUnfollowed.followers = JSON.parse(userUnfollowed.followers);
    const idxUnfollowed = userUnfollowed.followers.indexOf(userId);
    userUnfollowed.followers.splice(idxUnfollowed, 1);
    userUnfollowed.followers = JSON.stringify(userUnfollowed.followers);
    await userUnfollowed.save();

    return { message: "Following added." };
  },
};
