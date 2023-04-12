const jwt = require('jsonwebtoken');
const User = require('../models/user');
const {secretOrKey} = require('../config/keys');

async function authenticate (req, res, next) {
    try {
        const token = req.header('Authorization').replace(/^Bearer\s+/, "");
        console.log(req.header('Authorization'))

        // const token = req.bo dy.token;

        if (!token) {
            return res.status(401).json({
                message : 'Authentication Failed!'
            });
        }

        const decoded = await jwt.verify(token, secretOrKey, (err, decoded) => {
            if (err && err.message === "jwt expired") 
                throw new Error("Authentication Failed. Please Logout And Login Again.");
            console.log("after auth")
            return decoded;
            
        });
      
        const user = await User.findOne({ 
            _id: decoded.id, 
            email: decoded.email,
        });

        if (!user) {
           return res.status(401).json({ message : 'Authentication Failed!' });
        }

        req.body.user = user;
        req.body.token = token;
        next();
    } catch (error) {
        console.log(error.message);
        return res.status(401).json({message : error.message });
    }
}

module.exports = { authenticate };