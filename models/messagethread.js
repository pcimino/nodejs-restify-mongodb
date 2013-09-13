
/**
 * Module dependencies.
 */
var mongoose = require('mongoose')
  , Schema = mongoose.Schema
  , ObjectId = Schema.ObjectId;

/**
 * Message Schema
 */
var MessageThreadSchema = new Schema({
  id: ObjectId
  , version: { type: Number }
  , fromUserId: { type: ObjectId }
  , toUserId: { type: ObjectId }
  , fromUsername: { type: String, trim: true }
  , toUsername: { type: String, trim: true }
  , subject: { type: String, trim: true }
  , messages: [String]
  , archiveFlag: { type: Boolean, default: false }
  , systemMessageFlag: { type: Boolean, default: false } // Used for priority messages from the system tot he user
})

module.exports = mongoose.model('MessageThread', MessageThreadSchema)


