/**
 * Mongoose model Snippets.
*/

'use strict'

let mongoose = require('mongoose')

// Create a schema for snippets
let snippetSchema = mongoose.Schema({
  username: { type: String },
  title: { type: String, required: true },
  snippet: { type: String, required: true },
  posted: { type: Date, required: true, default: Date.now }
})

// Create a model using the schema
let Snippets = mongoose.model('snippetDB', snippetSchema)

module.exports = Snippets
