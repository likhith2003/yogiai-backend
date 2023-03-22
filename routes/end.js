const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passport = require('passport');

const User = require('../models/user');
const keys = require('../config/keys');
const router = express.Router();

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
                  name: user.name,
                  email: user.email,
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
            const payload = { id: user.id, name: user.name, email: user.email };

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

module.exports = router;