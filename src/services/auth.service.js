const httpStatus = require("http-status").status;
const { OAuth2Client } = require("google-auth-library");
const tokenService = require("./token.service");
const userService = require("./user.service");
const Token = require("../models/token.model");
const { User } = require("../models");
const ApiError = require("../utils/ApiError");
const { tokenTypes } = require("../config/tokens");
const config = require("../config/config");

const googleClient = new OAuth2Client(config.google.clientId);

/**
 * Login with username and password
 * @param {string} email
 * @param {string} password
 * @returns {Promise<User>}
 */
const loginUserWithEmailAndPassword = async (email, password) => {
  const user = await userService.getUserByEmail(email);
  if (!user || !(await user.isPasswordMatch(password))) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Incorrect email or password");
  }
  return user;
};

/**
 * Logout
 * @param {string} refreshToken
 * @returns {Promise}
 */
const logout = async (refreshToken) => {
  const refreshTokenDoc = await Token.findOne({
    token: refreshToken,
    type: tokenTypes.REFRESH,
    blacklisted: false,
  });
  if (!refreshTokenDoc) {
    throw new ApiError(httpStatus.NOT_FOUND, "Not found");
  }
  await Token.deleteOne({ _id: refreshTokenDoc._id });
};

/**
 * Refresh auth tokens
 * @param {string} refreshToken
 * @returns {Promise<Object>}
 */
const refreshAuth = async (refreshToken) => {
  try {
    const refreshTokenDoc = await tokenService.verifyToken(
      refreshToken,
      tokenTypes.REFRESH,
    );
    const user = await userService.getUserById(refreshTokenDoc.user);
    if (!user) {
      throw new Error();
    }
    await refreshTokenDoc.deleteOne();
    return tokenService.generateAuthTokens(user);
  } catch (error) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Please authenticate");
  }
};

/**
 * Reset password
 * @param {string} resetPasswordToken
 * @param {string} newPassword
 * @returns {Promise}
 */
const resetPassword = async (resetPasswordToken, newPassword) => {
  try {
    const resetPasswordTokenDoc = await tokenService.verifyToken(
      resetPasswordToken,
      tokenTypes.RESET_PASSWORD,
    );
    const user = await userService.getUserById(resetPasswordTokenDoc.user);
    if (!user) {
      throw new Error();
    }
    await userService.updateUserById(user.id, { password: newPassword });
    await Token.deleteMany({ user: user.id, type: tokenTypes.RESET_PASSWORD });
  } catch (error) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Password reset failed");
  }
};

/**
 * Verify email
 * @param {string} verifyEmailToken
 * @returns {Promise}
 */
const verifyEmail = async (verifyEmailToken) => {
  try {
    const verifyEmailTokenDoc = await tokenService.verifyToken(
      verifyEmailToken,
      tokenTypes.VERIFY_EMAIL,
    );
    const user = await userService.getUserById(verifyEmailTokenDoc.user);
    if (!user) {
      throw new Error();
    }
    await Token.deleteMany({ user: user.id, type: tokenTypes.VERIFY_EMAIL });
    await userService.updateUserById(user.id, { isEmailVerified: true });
  } catch (error) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Email verification failed");
  }
};

/**
 * Fetch image from URL and return as Buffer
 * @param {string} url - The image URL
 * @returns {Promise<Buffer>}
 */
const fetchImageAsBuffer = async (url) => {
  const response = await fetch(url);
  if (!response.ok) {
    return null;
  }
  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
};

/**
 * Login or register with Google
 * @param {string} idToken - The Google ID token from frontend
 * @returns {Promise<User>}
 */
const loginWithGoogle = async (idToken) => {
  let payload;
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: config.google.clientId,
    });
    payload = ticket.getPayload();
  } catch (error) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Invalid Google token");
  }

  const { sub: googleId, email, name, picture } = payload;

  // Try to find user by Google ID first
  let user = await User.findByGoogleId(googleId);

  if (user) {
    // User exists with this Google ID, update picture if needed
    if (picture) {
      const pictureBuffer = await fetchImageAsBuffer(picture);
      if (pictureBuffer) {
        user.picture = pictureBuffer;
        await user.save();
      }
    }
    return user;
  }

  // Try to find user by email (for linking accounts)
  user = await userService.getUserByEmail(email);

  if (user) {
    // Link Google account to existing user
    user.googleId = googleId;
    if (picture) {
      const pictureBuffer = await fetchImageAsBuffer(picture);
      if (pictureBuffer) {
        user.picture = pictureBuffer;
      }
    }
    await user.save();
    return user;
  }

  // Create new user
  const pictureBuffer = picture ? await fetchImageAsBuffer(picture) : null;
  user = await User.create({
    name,
    email,
    googleId,
    picture: pictureBuffer,
    isEmailVerified: true, // Google emails are verified
  });

  return user;
};

module.exports = {
  loginUserWithEmailAndPassword,
  logout,
  refreshAuth,
  resetPassword,
  verifyEmail,
  loginWithGoogle,
};
