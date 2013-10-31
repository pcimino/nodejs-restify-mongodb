/**
 * Module dependencies.
 */
var mongoose = require('mongoose')
  , Schema = mongoose.Schema
  , ObjectId = Schema.ObjectId
  , restify = require('restify');

/**
 * Beta Invite
 */
var BetaInviteSchema = new Schema({
  id: ObjectId
  , email: { type: String, trim: true, lowercase: true, required: true }
  , betaCode: { type: String, trim: true }
})

/**
 * Validations
 */
var validatePresenceOf = function (value) {
  return value && (value.length > 6)
}

/**
 * Pre-save hook
 */
BetaInviteSchema.pre('save', function(next) {
  if (!validatePresenceOf(this.betaCode)) {
    next(new restify.MissingParameterError('Invalid Beta Code'));
  }
  next();
})

module.exports = mongoose.model('BetaInvite', BetaInviteSchema)






