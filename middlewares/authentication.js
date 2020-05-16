var firebaseAdmin = require('../firebase_admin');

var authorizeCookie = async function (req, res, next) {
  const authtoken = req.cookies.authtoken || '';
  firebaseAdmin.auth().verifySessionCookie(authtoken, true).then(user => {
    req.user = user
    next();
  }).catch(() => {
    res.redirect('/login');
  });
};

var authorizeApi = async function (req, res, next) {
  const idToken = req.headers.authorization;
  firebaseAdmin.auth().verifyIdToken(idToken).then(decodedToken =>{
      req.user = decodedToken
      next();
    }).catch(err => {
      return res.status(403).send("Not authorized!");
    });
};


var authorize = async function (req, res, next) {
  if (req.headers.authorization != undefined) {
    return authorizeApi(req, res, next);
  } else {
    if (req.cookies.authtoken) {
      return authorizeCookie(req, res, next);
    } else {
      return res.status(401).send("Not authorized!");
    }
  }
};


module.exports.cookie = authorizeCookie;
module.exports.api = authorizeApi;
module.exports.auth = authorize;