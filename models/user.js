
/**
 * Module dependencies.
 */

var mongoose = require('mongoose')
  , Schema = mongoose.Schema
  , ObjectId = Schema.ObjectId
  , crypto = require('crypto')
  , restify = require('restify');

/**
 * User Schema
 */

var UserSchema = new Schema({
  id: ObjectId,
  name: { type: String, trim: true },
  email: { type: String, trim: true },
  username: { type: String, trim: true },
  role: { type: String, enum: ['User', 'Subscriber', 'Admin'], default: 'User' },
  hashed_password: { type: String, trim: true },
})


/**
 * Virtuals
 */

UserSchema
  .virtual('password')
  .set(function(password) {
    this._password = password
    this.hashed_password = this.encryptPassword(password)
  })
  .get(function() { return this._password })

/**
 * Validations
 */

var validatePresenceOf = function (value) {
  return value && value.length
}

// the below 4 validations only apply if you are signing up traditionally

//TODO Why aren't the custom messages working?
UserSchema.path('name').validate(function (name) {
  // if you are authenticating by any of the oauth strategies, don't validate
  if (authTypes.indexOf(this.provider) !== -1) return true
  return validatePresenceOf(name);
}, 'Name cannot be blank')

UserSchema.path('email').validate(function (email) {
  // if you are authenticating by any of the oauth strategies, don't validate
  if (authTypes.indexOf(this.provider) !== -1) return true
  return validatePresenceOf(email);
}, 'Email cannot be blank')

UserSchema.path('username').validate(function (username) {
  // if you are authenticating by any of the oauth strategies, don't validate
  if (authTypes.indexOf(this.provider) !== -1) return true
  return validatePresenceOf(username);
}, 'Username cannot be blank')

UserSchema.path('hashed_password').validate(function (hashed_password) {
  // if you are authenticating by any of the oauth strategies, don't validate
  if (authTypes.indexOf(this.provider) !== -1) return true
  return validatePresenceOf(hashed_password);
}, 'Password cannot be blank')

/**
 * Pre-save hook
 */

UserSchema.pre('save', function(next) {
  if (!this.isNew) return next();
  if (!validatePresenceOf(this.password) && authTypes.indexOf(this.provider) === -1) {
    next(new restify.MissingParameterError('Invalid password'));
  }
  next();
})

/**
 * Methods
 */

UserSchema.methods = {

  /**
   * Authenticate - check if the passwords are the same
   *
   * @param {String} plainText
   * @return {Boolean}
   * @api public
   */
   authenticate: function(plainText) {
      return this.encryptPassword(plainText) === this.hashed_password;
   },

  /**
   * Encrypt password
   *
   * @param {String} password
   * @return {String}
   * @api public
   */
   encryptPassword: function(password) {
      if (!password) return ''
      return crypto.createHmac('sha1', this._id.toString()).update(password).digest('hex'); // using the ObjectId as the salt
   },
  
  /**
   * allowAccess
   *
   * @param {String} role
   * @return {Boolean}
   * @api public
   */
   allowAccess: function(role) {
      if (this.role == 'Admin') return true; // Admin can access everything
      if (role == 'Subscriber' && this.role == 'Subscriber') return true; // Subscriber can access Subscriber and User
      if (role == 'User' && (this.role == 'User' || this.role == 'Subscriber')) return true; // user is at the bottom of special access
      return false; // should only happen if checking access for an anonymous user
   }
}

mongoose.model('User', UserSchema)
