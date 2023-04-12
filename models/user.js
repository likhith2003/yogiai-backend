const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  firstname: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  lastname: {
      type: String,
      required: false
  },
  password: {
    type: String,
    required: true,
    minLength: 8,
    },
  username: {
        type: String,
        required: false
  },
  checkfiles: {
    type: String,
    required: false
  }
  
});

module.exports = mongoose.model('user', UserSchema);