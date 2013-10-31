/**
 * Module dependencies.
 */
var mongoose = require('mongoose')
  , Schema = mongoose.Schema
  , ObjectId = Schema.ObjectId;

/**
 * Beta status
 */
var BetaSchema = new Schema({
  id: ObjectId
  , status: { type: Boolean, default: false }
})

module.exports = mongoose.model('Beta', BetaSchema)
