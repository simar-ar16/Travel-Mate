function checkAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).render('admin/accessDenied', { user: req.user });
  }
  next();
}

module.exports = checkAdmin;
