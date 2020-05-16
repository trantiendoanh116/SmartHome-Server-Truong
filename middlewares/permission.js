// middleware for doing role-based permissions
var permit = function(allowed) {
    const isAllowed = roles => roles.indexOf(allowed) > -1;
        
    return (req, res, next) => {
      if (req.user && isAllowed(req.user.roles))
        next(); 
      else {
        res.status(403).json({message: "Forbidden"}); // user is forbidden
      }
    }
  };
module.exports = permit;