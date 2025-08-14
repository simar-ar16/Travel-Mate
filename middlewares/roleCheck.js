function allowRoles(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.redirect('/user/login');
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).send('Access denied');
    }
    next();
  };
}

module.exports = allowRoles;
