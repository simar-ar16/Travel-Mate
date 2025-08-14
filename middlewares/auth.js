const { getUser } = require('../service/auth'); 

function checkForAuthentication(req, res, next) {
  req.user = null;
  res.locals.user = null;

  const token = req.cookies?.token;
  if (!token) return next();

  const payload = getUser(token);
  if (!payload) {
    return next();
  }

  req.user = {
    id: payload._id,
    email: payload.email,
    role: payload.role,
  };
  res.locals.user = req.user;
  next();
}

module.exports = checkForAuthentication;
