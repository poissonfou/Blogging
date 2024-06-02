const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const levenshtein = require("js-levenshtein");
const { QueryTypes } = require("sequelize");
const sequelize = require("../database");

const User = require("../models/user");
const Post = require("../models/post");
const Comment = require("../models/comment");
const io = require("../socket");
const { authenticateUserGraphQL } = require("../auth/auth");

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
      { expiresIn: "8h" }
    );

    return {
      token,
      id: user[0].dataValues.id,
      tag: !user[0].dataValues.tag
        ? "NO_TAG_RESTIGERED"
        : user[0].dataValues.tag.length,
    };
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
      { expiresIn: "8h" }
    );

    return { token, id: newUser.id, tag: "NO_TAG_RESTIGERED" };
  },
  update: async ({ name, password, confirm, token }) => {
    const nameVal = name;
    const passwordVal = password.trim();
    const confirmVal = confirm.trim();

    const userId = authenticateUserGraphQL(token);

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

    const user = await User.findByPk(userId);

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
  getUser: async ({ id, route, token }) => {
    let userId = id;
    if (userId < 0 || typeof userId !== "number") {
      const error = new Error("Invalid id.");
      error.status = 500;
      throw error;
    }

    if (route === "/dashboard") {
      userId = authenticateUserGraphQL(token);
    }

    const user = await User.findByPk(userId);

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
  getPost: async ({ postId }) => {
    if (postId < 0 || typeof postId !== "number") {
      const error = new Error("Invalid parameter provided.");
      error.status = 500;
      throw error;
    }

    const post = await Post.findByPk(postId);

    if (!post) {
      const error = new Error("Post not found.");
      error.status = 500;
      throw error;
    }

    const user = await User.findByPk(post.userId);

    if (!user) {
      const error = new Error("No user found.");
      error.status = 500;
      throw error;
    }

    post.tags = JSON.parse(post.tags);

    return {
      author: { ...user.dataValues },
      ...post.dataValues,
    };
  },
  getFeed: async ({ token }) => {
    const filteredPosts = [];
    const userId = authenticateUserGraphQL(token);

    const user = await User.findByPk(userId);
    user.following = JSON.parse(user.following);

    const currentDate = new Date();
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const dateFormat = new Intl.DateTimeFormat("pt-BR", { timeZone: tz });

    //gets posts of the one's the user follows, they are at most five days old.
    if (user.following.length) {
      user.following = user.following.map((fol) => JSON.parse(fol));

      for (let i = 0; i < user.following.length; i++) {
        const follow = await User.findByPk(+user.following[i].id);
        const posts = await follow.getPosts();

        for (let j = 0; j < posts.length; j++) {
          const postDate = new Date(+posts[j].createdAt);
          const formatedDate = dateFormat.format(postDate);
          const DateElements = formatedDate.split("/");
          if (
            DateElements[2] == currentDate.getFullYear() &&
            currentDate.getDate() - 5 <= DateElements[0]
          ) {
            posts[j].tags = JSON.parse(posts[j].tags);
            filteredPosts.push(posts[j].dataValues);
          }
        }
      }
    }

    console.log(filteredPosts);

    return { data: filteredPosts };
  },
  getComments: async ({ postId }) => {
    const post = await Post.findByPk(postId);

    if (!post) {
      const error = new Error("Post not found.");
      error.status = 500;
      throw error;
    }

    const comments = await post.getComments();

    if (!comments) {
      const error = new Error("Could not fetch comments");
      error.status = 500;
      throw error;
    }

    for (let i = 0; i < comments.length; i++) {
      const comment = comments[i];
      comments[i].dataValues.likes = JSON.parse(comment.dataValues.likes);
      comments[i].dataValues.dislikes = JSON.parse(comment.dataValues.dislikes);
      const author = await User.findByPk(comment.author);
      comments[i].dataValues.author = { ...author.dataValues };
    }

    return comments;
  },
  search: async ({ query, userId }) => {
    const queryLowerCase = query.toLowerCase();
    const firstCaracthers = queryLowerCase.slice(0, 4);
    const usersResults = [];
    const postsResults = [];

    const users = await sequelize.query(
      `SELECT * FROM users WHERE (lower(name) LIKE '${firstCaracthers}%' )`,
      {
        type: QueryTypes.SELECT,
      }
    );

    const usersPerTags = await sequelize.query(
      `SELECT * FROM users WHERE (lower(tag) LIKE '@${firstCaracthers}%' )`,
      {
        type: QueryTypes.SELECT,
      }
    );

    const posts = await sequelize.query(
      `SELECT * FROM posts WHERE (lower(title) LIKE '${firstCaracthers}%' )`,
      {
        type: QueryTypes.SELECT,
      }
    );

    if (!users.length && !posts.length && !usersPerTags.length) {
      return { message: "No results found" };
    }

    for (let i = 0; i < users.length; i++) {
      const dist = levenshtein(queryLowerCase, users[i].name);
      if (dist < 5 && users[i].id !== userId) {
        const followers = JSON.parse(users[i].followers);
        const following = JSON.parse(users[i].following);

        const parseFollowers = followers.map((fol) => JSON.parse(fol));
        const parsedFollowing = following.map((fol) => JSON.parse(fol));

        usersResults.push({
          id: users[i].id,
          name: users[i].name,
          picture: users[i].picture,
          followers: parseFollowers,
          following: parsedFollowing,
          tag: users[i].tag,
        });
      }
    }

    for (let i = 0; i < usersPerTags.length; i++) {
      const dist = levenshtein(queryLowerCase, usersPerTags[i].tag);
      const idxUser = usersResults
        .map((user) => user.tag)
        .indexOf(usersPerTags[i].tag);
      if (dist < 5 && idxUser == -1 && usersPerTags[i].id !== userId) {
        const followers = JSON.parse(usersPerTags[i].followers);
        const following = JSON.parse(usersPerTags[i].following);

        const parseFollowers = followers.map((fol) => JSON.parse(fol));
        const parsedFollowing = following.map((fol) => JSON.parse(fol));

        usersResults.push({
          id: usersPerTags[i].id,
          name: usersPerTags[i].name,
          picture: usersPerTags[i].picture,
          followers: parseFollowers,
          following: parsedFollowing,
          tag: usersPerTags[i].tag,
        });
      }
    }

    for (let j = 0; j < posts.length; j++) {
      const dist = levenshtein(queryLowerCase, posts[j].title);
      if (dist < 30) {
        posts[j].tags = JSON.parse(posts[j].tags);
        postsResults.push(posts[j]);
      }
    }

    if (!usersResults.length && !postsResults.length)
      return { message: "No results found" };

    return {
      users: usersResults,
      posts: postsResults,
    };
  },
  addPost: async ({ postInput }) => {
    const title = postInput.title;
    const abstract = postInput.abstract;
    const body = postInput.body;
    const tags = postInput.tags;
    const images = postInput.images;
    const token = postInput.token;

    const userId = authenticateUserGraphQL(token);

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

    const user = await User.findByPk(userId);

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
    const token = postInput.token;

    authenticateUserGraphQL(token);

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
  deletePost: async ({ id, token }) => {
    const post = await Post.findByPk(id);

    authenticateUserGraphQL(token);

    if (!post) {
      throw new Error("Post not found.");
    }

    await post.destroy();

    return { message: "Success" };
  },
  follow: async ({ id, token }) => {
    const userId = authenticateUserGraphQL(token);

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
  unfollow: async ({ id, token }) => {
    const userId = authenticateUserGraphQL(token);
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
  comment: async ({ postId, comment, token }) => {
    const userId = authenticateUserGraphQL(token);

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
      author: userId,
      likes: JSON.stringify([]),
      dislikes: JSON.stringify([]),
    });

    if (!newComment) {
      const error = new Error("Coulnd't create comment.");
      error.status = 422;
      throw error;
    }

    return {
      author: {
        name: "",
        id: -1,
        picture: "",
      },
      content: newComment.dataValues.content,
      likes: JSON.parse(newComment.dataValues.likes),
      dislikes: JSON.parse(newComment.dataValues.dislikes),
    };
  },
  commentInteraction: async ({ type, token, commentId }) => {
    const userId = authenticateUserGraphQL(token);
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
