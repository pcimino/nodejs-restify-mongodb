/**
 * Module dependencies.
 */
var mongoose = require('mongoose')
  , Schema = mongoose.Schema
  , ObjectId = Schema.ObjectId;

/**
 * Create one for each user when they dismiss the system message as read
 */
var SystemMessageArchiveSchema = new Schema({
  id: ObjectId
  , systemMessageId: { type: ObjectId }
  , userId: { type: ObjectId }
})

module.exports = mongoose.model('SystemMessageArchive', SystemMessageArchiveSchema)




