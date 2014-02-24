/**
 * Module dependencies.
 */
var mongoose = require('mongoose')
  , Schema = mongoose.Schema
  , ObjectId = Schema.ObjectId;

/**
 * System broadcast messages
 */
var TermsAndConditionsSchema = new Schema({
  id: ObjectId
  , acceptedDate: { type: Date }
  , createDate: { type: Date }
  , fromUserId: { type: ObjectId }
  , fromUsername: { type: String, trim: true }

  , subject: { type: String, trim: true }
  , message: { type: String, trim: true }
})

module.exports = mongoose.model('TermsAndConditions', TermsAndConditionsSchema)







