
/**
 * Module dependencies.
 */

var mongoose = require('mongoose')
  , Schema = mongoose.Schema
  , ObjectId = Schema.ObjectId
  , restify = require('restify');

/**
 * Verify Code is used to validate new accounts/email addresses
 */

var VerifyCodeSchema = new Schema({
  id: ObjectId,
  userObjectId: ObjectId,
  key: { type: String, trim: true }
})

/**
 * Validations
 */

var validatePresenceOf = function (value) {
  return value && (value.length >= 12)
}

/**
 * Pre-save hook
 */

VerifyCodeSchema.pre('save', function(next) {
  if (!validatePresenceOf(this.key)) {
    next(new restify.MissingParameterError('Invalid key'));
  }
  next();
})


mongoose.model('VerifyCode', VerifyCodeSchema)
