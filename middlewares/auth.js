const jwt = require("jsonwebtoken")

function authenticate(req, res, next) {
   
    if (req.path === '/login') { // Let user go to hte login page
        return next();
    }
    const token = req.cookies.jwt;
    if (token == null) return res.redirect("/admin/login"); // Unauthorized if token is not present

    jwt.verify(token, process.env.API_KEY, (err, user) => {
        if (err) return res.sendStatus(403); // Forbidden if token is invalid
        req.user = user;
        next(); // If token is valid, continue to the next middleware or route handler
    });
}
module.exports = {
    authenticate 
};
