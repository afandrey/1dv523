/**
 * Mongoose model Users.
*/

'use strict'

let mongoose = require('mongoose')
let bcrypt = require('bcrypt-nodejs')

// Create a schema for users
let userSchema = mongoose.Schema({
  username: { type: String, required: true, unique: true, maxlength: 20 },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, minlength: 6 }
})

// Using a pre-hook (runs before saving)
userSchema.pre('save', function (next) {
  let user = this

  bcrypt.genSalt(10, function (err, salt) {
    if (err) {
      return next(err)
    }

    bcrypt.hash(user.password, salt, null, function (err, hash) {
      if (err) {
        return next(err)
      }
      user.password = hash

      next()
    })
  })
})

// Compare passwords to authenticate
userSchema.methods.comparePassword = function (pass, callback) {
  bcrypt.compare(pass, this.password, function (err, res) {
    if (err) {
      return callback(err)
    }
    callback(null, res)
  })
}

// Create a model using the schema
let Users = mongoose.model('User', userSchema)

module.exports = Users
