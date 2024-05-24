const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/user");
const Post = require("../models/post");
const Comment = require("../models/comment");
const io = require("../socket");

module.exports = {
  login: async ({ email, password }) => {
    let errorMessage;

    if (!validator.isEmail(email.trim())) {
      errorMessage = "Invalid email.";
    }

    if (validator.isEmpty(password.trim())) {
      errorMessage = "Please enter a password.";
    }

    if (password.trim().length <= 5) {
      errorMessage = "Password must be at least 6 digits.";
    }

    if (errorMessage) {
      const error = new Error(errorMessage);
      error.status = 422;
      throw error;
    }

    const user = await User.findAll({
      where: {
        email: email.trim(),
      },
    });

    if (!user.length) {
      const error = new Error(
        "A user with this email doesn't exist. Please signup."
      );
      error.status = 422;
      throw error;
    }

    const isEqual = await bcrypt.compare(
      password.trim(),
      user[0].dataValues.password
    );

    if (!isEqual) {
      const error = new Error("Incorrect password.");
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
  signup: async ({ signupInput }) => {
    let errorMessage;

    if (!validator.isEmail(signupInput.email.trim())) {
      errorMessage = "Invalid email.";
    }

    if (
      validator.isEmpty(signupInput.password.trim()) ||
      signupInput.password.length <= 5
    ) {
      errorMessage = "Password should be at least 6 digits.";
    }

    if (signupInput.password.trim() !== signupInput.confirm.trim()) {
      errorMessage = "Password must be equal.";
    }

    if (validator.isEmpty(signupInput.name)) {
      errorMessage = "Please enter your name.";
    }

    if (errorMessage) {
      const error = new Error(errorMessage);
      error.status = 422;
      throw error;
    }

    const user = await User.findAll({
      where: {
        email: signupInput.email.trim(),
      },
    });

    if (user.length) {
      const error = new Error("A user with this email already exists.");
      error.status = 422;
      throw error;
    }

    const password = await bcrypt.hash(signupInput.password.trim(), 12);

    const newUser = await User.create({
      name: signupInput.name,
      email: signupInput.email.trim(),
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
    const nameVal = name;
    const passwordVal = password.trim();
    const confirmVal = confirm.trim();

    if (!nameVal.length && !passwordVal.length) {
      const error = new Error("You must provide at least one value.");
      error.status = 422;
      throw error;
    }

    if (passwordVal.length) {
      if (passwordVal !== confirmVal) {
        const error = new Error("Passwords must match.");
        error.status = 422;
        throw error;
      }

      if (passwordVal.length < 6) {
        const error = new Error("Password needs to be at least six digits.");
        error.status = 422;
        throw error;
      }
    }

    if (validator.isEmpty(nameVal)) {
      const error = new Error("Please enter your name.");
      error.status = 422;
      throw error;
    }

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
      const newPassword = await bcrypt.hash(passwordVal, 12);
      user.password = newPassword;
    }

    await user.save();

    return { message: "Success" };
  },
  getUser: async ({ id }) => {
    if (id < 0 || typeof id !== "number") {
      const error = new Error("Invalid id.");
      error.status = 500;
      throw error;
    }

    const user = await User.findByPk(id);

    if (!user) {
      const error = new Error("User not found.");
      error.status = 500;
      throw error;
    }

    const posts = await user.getPosts();

    if (!posts) {
      const error = new Error("Failed to retrieve posts. Please reload.");
      error.status = 500;
      throw error;
    }

    for (let i = 0; i < posts.length; i++) {
      let p = posts[i].dataValues;

      posts[i].dataValues.tags = JSON.parse(p.tags);
      posts[i].dataValues.images = JSON.parse(p.images);
    }

    const followers = JSON.parse(user.followers);
    const following = JSON.parse(user.following);

    const parseFollowers = followers.map((fol) => JSON.parse(fol));
    const parsedFollowing = following.map((fol) => JSON.parse(fol));

    return {
      id: user.id,
      name: user.name,
      picture: user.picture,
      posts: posts,
      followers: parseFollowers,
      following: parsedFollowing,
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
        const comments = await posts[i].getComments();
        posts[i].dataValues.comments = comments;
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

    console.log(selectedPost);
    for (let i = 0; i < selectedPost.comments.length; i++) {
      const comment = selectedPost.comments[i];
      comment.dataValues.likes = JSON.parse(comment.dataValues.likes);
      comment.dataValues.dislikes = JSON.parse(comment.dataValues.dislikes);
    }

    return {
      author: user,
      comments: [{ ...selectedPost.comments.dataValues }],
      ...selectedPost,
    };
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

    if (
      !title.length ||
      validator.isEmpty(title, { ignore_whitespace: true })
    ) {
      const error = new Error("Please add a title.");
      error.status = 422;
      throw error;
    }

    if (
      !abstract.length ||
      validator.isEmpty(abstract, { ignore_whitespace: true })
    ) {
      const error = new Error("Please add an abstract to your post.");
      error.status = 422;
      throw error;
    }

    if (!body.length || validator.isEmpty(body, { ignore_whitespace: true })) {
      const error = new Error("Please add content to your post.");
      error.status = 422;
      throw error;
    }

    if (!tags.length) {
      const error = new Error("Please add at least one tag.");
      error.status = 422;
      throw error;
    }

    const user = await User.findByPk(id);

    if (!user) {
      const error = new Error("Could not save your post. Please try again.");
      error.status = 422;
      throw error;
    }

    const post = await user.createPost({
      title,
      abstract,
      body,
      tags: JSON.stringify(tags),
      images: JSON.stringify(images),
    });

    if (!post) {
      const error = new Error("Could not save your post. Please try again.");
      error.status = 422;
      throw error;
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

    if (!postId || typeof +postId !== "number") {
      const error = new Error(
        "Could not get post id. Please reload and try again."
      );
      error.status = 422;
      throw error;
    }

    if (
      !title.length ||
      validator.isEmpty(title, { ignore_whitespace: true })
    ) {
      const error = new Error("Please add a title.");
      error.status = 422;
      throw error;
    }

    if (
      !abstract.length ||
      validator.isEmpty(abstract, { ignore_whitespace: true })
    ) {
      const error = new Error("Please add an abstract to your post.");
      error.status = 422;
      throw error;
    }

    if (!body.length || validator.isEmpty(body, { ignore_whitespace: true })) {
      const error = new Error("Please add content to your post.");
      error.status = 422;
      throw error;
    }

    if (!tags.length) {
      const error = new Error("Please add at least one tag.");
      error.status = 422;
      throw error;
    }

    const post = await Post.findByPk(postId);

    if (!post) {
      const error = new Error("Unable to fetch post. Please try again.");
      error.status = 500;
      throw error;
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
    const userFollowed = await User.findByPk(id);

    if (!user) {
      return { message: "User not found." };
    }

    user.following = JSON.parse(user.following);
    if (user.following.length) {
      if (user.following.map((fol) => fol.id).indexOf(id))
        return { message: "User already follows this account" };
    }

    user.following.push(
      JSON.stringify({
        name: userFollowed.name,
        picture: userFollowed.picture,
        id: userFollowed.id,
        tag: userFollowed.tag,
      })
    );
    user.following = JSON.stringify(user.following);
    await user.save();

    if (!userFollowed) {
      return { message: "User being followed not found." };
    }

    userFollowed.followers = JSON.parse(userFollowed.followers);
    userFollowed.followers.push(
      JSON.stringify({
        name: user.name,
        picture: user.picture,
        id: user.id,
        tag: user.tag,
      })
    );
    userFollowed.followers = JSON.stringify(userFollowed.followers);
    await userFollowed.save();

    io.getIO().emit("follow", {
      action: "follow",
      follower: { name: user.name, picture: user.picture, id: user.id },
      following: userFollowed.tag,
    });

    return {
      name: userFollowed.name,
      picture: userFollowed.picture,
      id: userFollowed.id,
      tag: userFollowed.tag,
    };
  },
  unfollow: async ({ id, userId }) => {
    const user = await User.findByPk(userId);

    if (!user) {
      return { message: "User not found." };
    }

    user.following = JSON.parse(user.following);
    const idx = user.following.map((fol) => JSON.parse(fol).id).indexOf(id);
    if (idx == -1) return { message: "Unfollowed account not found." };
    user.following.splice(idx, 1);
    user.following = JSON.stringify(user.following);
    await user.save();

    const userUnfollowed = await User.findByPk(id);

    if (!userUnfollowed) {
      return { message: "User not found." };
    }

    userUnfollowed.followers = JSON.parse(userUnfollowed.followers);
    const idxUnfollowed = userUnfollowed.followers
      .map((fol) => JSON.parse(fol).id)
      .indexOf(userId);
    userUnfollowed.followers.splice(idxUnfollowed, 1);
    userUnfollowed.followers = JSON.stringify(userUnfollowed.followers);
    await userUnfollowed.save();

    return { message: "Following added." };
  },
  comment: async ({ postId, comment, author, picture, authorId }) => {
    if (!postId && typeof +postId !== "number") {
      const error = new Error("Coulnd't find post.");
      error.status = 422;
      throw error;
    }

    if (!comment.length && !comment.replace(/\s/g, "").length) return;

    const post = await Post.findByPk(postId);

    if (!post) {
      const error = new Error("Coulnd't find post.");
      error.status = 422;
      throw error;
    }

    const newComment = await post.createComment({
      content: comment,
      author,
      picture,
      authorId,
      likes: JSON.stringify([]),
      dislikes: JSON.stringify([]),
    });

    if (!newComment) {
      const error = new Error("Coulnd't create comment.");
      error.status = 422;
      throw error;
    }

    return {
      ...newComment.dataValues,
    };
  },
  commentInteraction: async ({ type, userId, commentId }) => {
    const comment = await Comment.findByPk(commentId);

    if (!comment) {
      const error = new Error("Coundn't find comment");
      error.status = 422;
      throw error;
    }

    const oppositeAction = type == "likes" ? "dislikes" : "likes";
    const arr = JSON.parse(comment[type]);
    const isSelected = arr.includes(userId);

    const oppositeArr = JSON.parse(comment[oppositeAction]);
    const oppositeIdx = oppositeArr.indexOf(userId);

    if (!isSelected) {
      if (oppositeIdx !== -1) {
        oppositeArr.splice(oppositeIdx, 1);
        comment[oppositeAction] = JSON.stringify(oppositeArr);
      }
      arr.push(userId);
    } else {
      const idx = arr.indexOf(userId);
      arr.splice(idx, 1);
    }

    comment[type] = JSON.stringify(arr);

    await comment.save();

    return { message: "Sucess" };
  },
};
