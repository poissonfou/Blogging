const jwt = require("jsonwebtoken");

module.exports = {
  authenticateUserGraphQL: (token) => {
    let decodedToken;
    try {
      decodedToken = jwt.verify(token, "bloggingsecretyeehaaw");
    } catch (err) {
      const error = new Error("User not authenticated. Please login.");
      error.status = 401;
      throw error;
    }
    if (!decodedToken) {
      const error = new Error("User not authenticated. Please login.");
      error.status = 401;
      throw error;
    }

    return decodedToken.userId;
  },
  authenticateUserHTTP: (req) => {
    const authHeader = req.get("Authorization");
    if (!authHeader) {
      const error = new Error("Not Authenticated");
      error.statusCode = 401;
      throw error;
    }
    const token = authHeader.split(" ")[1];
    let decodedToken;
    try {
      decodedToken = jwt.verify(token, "bloggingsecretyeehaaw");
    } catch (err) {
      err.statusCode = 500;
      throw err;
    }
    if (!decodedToken) {
      const error = new Error("Not Authenticated");
      error.statusCode = 401;
      throw error;
    }

    return decodedToken.userId;
  },
};
