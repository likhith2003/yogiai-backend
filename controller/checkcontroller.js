const User = require('../models/user');

const checksforfile = (req, res, next) => {
    if (req.file) {
        User.checkfiles = req.file.path;
        res.json({
            message: "Check uploaded successfully"
        })
    }
    else {
        res.json({
            message: "An error occured"
        })
    }
}
module.exports = { checksforfile };