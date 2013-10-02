
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
  , createDate: { type: Date }
  , modifyDate: { type: Date }
  , fromUserId: { type: ObjectId }
  , toUserId: { type: ObjectId }
  , fromUsername: { type: String, trim: true }
  , toUsername: { type: String, trim: true }
  , subject: { type: String, trim: true }
  , messages: []
  , fromArchiveFlag: { type: Boolean, default: false } // so the sender can archive their view of it independently
  , toArchiveFlag: { type: Boolean, default: false } // so the recipient can archive their view of it independently
  , inappropriateFlag: { type: Boolean, default: false } // moderator flags messages
})

/**
 * Methods
 */

MessageThreadSchema.methods = {

  /**
   * AddReply - update the message array
   *
   * @param {String} from
   * @param {String} message
   * @api public
   */
   addReply: function(from, message) {
     this.messages.push({from: from, message: message});
     return true;
   }
}

module.exports = mongoose.model('MessageThread', MessageThreadSchema)





