/**
 * Module dependencies.
 */
var mongoose = require('mongoose')
  , Schema = mongoose.Schema
  , ObjectId = Schema.ObjectId;

/**
 * System broadcast messages
 */
var SystemMessageSchema = new Schema({
  id: ObjectId
  , createDate: { type: Date }
  , fromUserId: { type: ObjectId }
  , fromUsername: { type: String, trim: true }

  , subject: { type: String, trim: true }
  , message: { type: String, trim: true }
})

module.exports = mongoose.model('SystemMessage', SystemMessageSchema)





