const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const {authenticate} = require('../middleware/auth');
const User = require('../models/user');
const keys = require('../config/keys');
const router = express.Router();

require("dotenv").config();
const multer = require("multer");
const { s3Uploadv2, s3Uploadv3 } = require("../controller/s3Service"); 
const uuid = require("uuid").v4;
router.post("/", (req, res) => {
  let errors = {};
   console.log(req.body)
  User.findOne({ email: req.body.email })
    .then((user) => {
      if (user) {
        errors.msg = "Email already exists";
        return res.status(400).json(errors);
      } else {
        const newUser = new User({
          firstname: req.body.firstname,
          email: req.body.email,
          lastname: req.body.lastname,
          password: req.body.password,
          username: req.body.username,
        });

        bcrypt.genSalt(7, (err, salt) => {
          bcrypt.hash(newUser.password, salt, (err, hash) => {
            if (err) console.log(err);
            newUser.password = hash;
            newUser
              .save()
              .then((user) => {
                const payload = {
                  id: user.id,
                  email: user.email
                };

                jwt.sign(
                  payload,
                  keys.secretOrKey,
                  { expiresIn: 86400 },
                  (err, token) => {
                    res.json({
                      token: "Bearer " + token,
                    });
                  }
                );
              })
              .catch((err) => console.log(err));
          });
        });
      }
    })
    .catch((err) => {
      errors.msg = "Server error. Try again";
      return res.status(500).json(errors);
    });
});

router.post("/login", (req, res) => {
  let errors = {};

  const email = req.body.email;
  const password = req.body.password;

  User.findOne({ email })
    .then((user) => {
      if (user) {
        bcrypt.compare(password, user.password).then((matches) => {
          if (matches) {
            const payload = { id: user.id, email: user.email };

            jwt.sign(
              payload,
              keys.secretOrKey,
              { expiresIn: 86400 },
              (err, token) => {
                res.json({
                  token: "Bearer " + token,
                });
              }
            );
          } else {
            errors.msg = "Password incorrect";
            res.status(400).json(errors);
          }
        });
      } else {
        errors.msg = "Email not found";
        return res.status(400).json(errors);
      }
    })
    .catch((error) => console.log(error));
});

router.get(
    '/usersecrets',
    passport.authenticate('jwt', { session: false }),
    (req, res) => {
      res.json({
        id: req.user.id,
        name: req.user.name,
        email: req.user.email
      });
    }
  );

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (file.mimetype.split("/")[0] === "image") {
    cb(null, true);
  } else {
    cb(new multer.MulterError("LIMIT_UNEXPECTED_FILE"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 1000000000, files: 4 },
});

router.post("/s3",authenticate, upload.array("file"), async (req, res) => {
  try {
    const results = await s3Uploadv3(req.files);
    console.log(results);
    return res.json({ status: "success" });
  } catch (err) {
    console.log(err);
  }
});

router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        message: "file is too large",
      });
    }

    if (error.code === "LIMIT_FILE_COUNT") {
      return res.status(400).json({
        message: "File limit reached",
      });
    }

    if (error.code === "LIMIT_UNEXPECTED_FILE") {
      return res.status(400).json({
        message: "File must be an image",
      });
    }
  }
});

module.exports = router;