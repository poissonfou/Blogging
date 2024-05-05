const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/user");

module.exports = {
  login: async ({ email, password }) => {
    console.log(email, password);
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
};
