const path = require('path')
const multer = require('multer')
const user = require('../models/user')
const checksforfile = require('../controller/checkcontroller')

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'checks/')
    },
    filename: function (req, file, cb) {
        let ext = path.extname(file.originalname)
        cb(null, user.user + Date.now() + ext)
    }
})

var checksss = multer({
    storage: storage,
    fileFilter: function (req, file, callback) {
        if (
            file.mimetype == "image/jpeg" || file.mimetype == "pdf" || file.mimetype == "image/png" || file.mimetype == "image/jpg")
        {
            callback(null, true)
        } else {
            console.log("Only .png, .jpg , .pdf and .jpeg format allowed!")
            callback(null, false)
        }
    },
    limits: {
        fileSize: 1024 * 1024 * 10
    }
})

module.exports = checksss ;