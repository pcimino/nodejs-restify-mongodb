/**
 * Module dependencies.
 */
var mongoose = require('mongoose')
  , Schema = mongoose.Schema
  , ObjectId = Schema.ObjectId;

/**
 * Create one for each user when they dismiss the system message as read
 */
var TermsAndConditionsArchiveSchema = new Schema({
  id: ObjectId
  , termsId: { type: ObjectId }
  , userId: { type: ObjectId }
  , acceptedDate: { type: Date }
})

module.exports = mongoose.model('TermsAndConditionsArchive', TermsAndConditionsArchiveSchema)





