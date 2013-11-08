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
  , archiveFlag: { type: Boolean, default: false } // used for outputting only since this has to be mapped to a user's SystemmessageArchive instance
})

module.exports = mongoose.model('SystemMessage', SystemMessageSchema)







