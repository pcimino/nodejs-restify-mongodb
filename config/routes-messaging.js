/**
* Messaging Routes Module
*   Requires authenticated users
*/
var mongoose = require('mongoose')
  , MessageThread = mongoose.model('MessageThread')
  , ObjectId = mongoose.Types.ObjectId
  , restify = require('restify');


module.exports = function (app, config, auth) {

   /**
   * Post a message thread
   *
   * @param request can include an id, a username or no search param
   * @param response contains a populated User object
   * @param next method
   */
   function postMessageThread(req, res, next) {
      if (req.session && req.session.user) {
        var messageThread = new MessageThread(req.params);
        messageThread.version = 1;
        messageThread.systemMessageFlag = false; // need an admin api for creating system messages
        messageThread.message = null;
        messageThread.messages = [];
        messageThread.messages.push(req.params.message);

        messageThread.save(function (err, messageThread) {
          if (!err) {
            res.send(user{});
          } else {
            return next(err);
          }
        });

      }
   }

   /**
   * Put (Update) a message thread
   *
   * @param request can include an id, a username or no search param
   * @param response contains a populated User object
   * @param next method
   */
   function putMessageThread(req, res, next) {
     // TODO how to avoid collisions? Pull a message and check version #
      if (req.session && req.session.user) {
        // update, remove message form archival view
        // messageThread.fromArchiveFlag = false;
        // messageThread.toArchiveFlag = false;
      }
   }

   /**
   * Get a message thread
   *
   * @param request can include an id, a username or no search param
   * @param response contains a populated User object
   * @param next method
   */
   function getMessageThread(req, res, next) {
      if (req.session && req.session.user) {
// archiveFlag, senderFlag (true retrieves messageThreads user started, false: messageThreads started by another user)
      }
   }

   /**
   * Archive a message thread
   *
   * @param request can include an id, a username or no search param
   * @param response contains a populated User object
   * @param next method
   */
   function archiveMessageThread(req, res, next) {
      if (req.session && req.session.user) {
        // only archive this users' view
        // not using an else, possibly admin might moderate a message?
        /*
        if (req.session.user._id == messageThread.fromUserId) {
          messageThread.fromArchiveFlag = false;
        }
        if (req.session.user._id == messageThread.toUserId) {
          messageThread.toArchiveFlag = false;
        }*/
      }
   }

   /**
   * Post a message thread
   *
   * @param path
   * @param promised callback check authization
   * @param promised 2nd callback post
   */
   app.post('/api/v1/messageThread', auth.requiresLogin, postMessageThread);

   /**
   * Update a message thread
   *
   * @param path
   * @param promised callback check authization
   * @param promised 2nd callback update
   */
   app.put('/api/v1/messageThread', auth.requiresLogin, putMessageThread);

   /**
   * Get a message thread
   *
   * @param path
   * @param promised callback check authization
   * @param promised 2nd callback update
   */
   app.get('/api/v1/messageThread', auth.requiresLogin, getMessageThread);

   /**
   * Archive a message thread
   *
   * @param path
   * @param promised callback check authization
   * @param promised 2nd callback update
   */
   app.delete('/api/v1/messageThread', auth.requiresLogin, archiveMessageThread);

}







