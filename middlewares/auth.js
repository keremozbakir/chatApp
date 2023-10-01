const jwt = require("jsonwebtoken")
function authenticate(req, res, next) {
    const token = req.cookies.jwt;
    if (token == null) return res.redirect("/login"); // Unauthorized if token is not present

    jwt.verify(token, 'benimadimkerem', (err, user) => {
        if (err) return res.sendStatus(403); // Forbidden if token is invalid
        req.user = user;
        next(); // If token is valid, continue to the next middleware or route handler
    });
}
module.exports = {
    authenticate 
};
