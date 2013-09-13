
/**
 * Module dependencies.
 */

var mongoose = require('mongoose')
  , Schema = mongoose.Schema
  , ObjectId = Schema.ObjectId
  , crypto = require('crypto')
  , restify = require('restify');

/**
 * Sesison Key Schema so key isn't in code, but can be seen across servers
 */

var SessionKeySchema = new Schema({
  id: ObjectId
  , key: { type: String, trim: true }
})

/**
 * Validations
 */

var validatePresenceOf = function (value) {
  return value && (value.length >= 12)
}

//TODO Why aren't the custom messages working?
SessionKeySchema.path('key').validate(function (name) {
  return validatePresenceOf(this.key);
}, 'Key must be 12 characters or longer')

/**
 * Pre-save hook
 */

SessionKeySchema.pre('save', function(next) {
  if (!this.isNew) return next();
  if (!validatePresenceOf(this.key)) {
    next(new restify.MissingParameterError('Invalid key'));
  }
  next();
})


mongoose.model('SessionKey', SessionKeySchema)
