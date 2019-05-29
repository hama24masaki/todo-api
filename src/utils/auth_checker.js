
const NotFoundError = require("./not_found_error");
const models = require("../models");
const debug = require('debug')('app:auth');

/*
 * Check authentication and retrieve user-id from token.
 */
module.exports = function(req, res, next) {

  const token = req.header("Authentication");
  // debug(token);
  if (!token)
    return res.status(400).json({
      error: "Unautholized",
      message: "Token is missing. Please signin again."
    });

  return models.User.getByToken(token)
  .then(m => {
    req.header.authenticated_uid = m.id;
    // debug(`${token} ---> uid=${m.id}`)
    return next();
  })
  .catch(err => {
    if (err instanceof NotFoundError) {
      return res.status(400).json({
        error: "Unautholized",
        message: "Invalid token. Please signin again."
      });
    } else {
      return res.status(500).json({
        error: "Server error",
        message: `${err.name}: ${err.message}`,
      });
    }
  })
}
