
/**
 * Module dependencies.
 */

var mongoose = require('mongoose')
  , Schema = mongoose.Schema
  , ObjectId = Schema.ObjectId
  , User = mongoose.model('User');

/**
 * UserList Schema
 */

var UserListSchema = new Schema({
	// input search fields
	name: { type: String, default: '' }, // search name
	email: { type: String, default: '' }, // search email
	username: { type: String, default: '' }, // search username
	itemsPerPage: { type: Number, min: -1, default: -1}, // number of records to return, -1 is unlimited
	pageNumber: { type: Number, min: -1, default: -1}, // page number 1-N
	ascendingSortFlag: { type: Boolean, default: true },
	sortField: { type: String, default: '' },

	// output fields
	pageCount: Number, // number of pages based on the search criteria and # of results
	users: [] // wanted to specify [User] but the User.find() doesn't cast the array elements into User objects
})

module.exports = mongoose.model('UserList', UserListSchema)
