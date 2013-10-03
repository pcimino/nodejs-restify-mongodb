/**
* Messaging Routes Module
*   Requires authenticated users
*/
var mongoose = require('mongoose')
  , MessageThread = mongoose.model('MessageThread')
  , SystemMessage = mongoose.model('SystemMessage')
  , SystemMessageArchive = mongoose.model('SystemMessageArchive')
  , User = mongoose.model('User')
  , ObjectId = mongoose.Types.ObjectId
  , restify = require('restify');


module.exports = function (app, config, auth) {

   /**
   * Post a message thread
   *
   * @param request need to include the toUsername, toUserId, subject and message
   * @param response
   * @param next method
   */
   function postMessageThread(req, res, next) {
      // console.log(req.session.user + "::" + req.params.fromUsername +":" + req.params.fromUserId +":" + req.params.toUsername +":" + req.params.toUserId +":" + req.params.subject + ":" + req.params.message)
      if (req.session && req.session.user) {
        if (!req.params.toUsername) {
          return next(new restify.MissingParameterError('You must enter a recipient.'));
        }
        if (!req.params.toUserId) {
          return next(new restify.MissingParameterError('You must enter a recipient.'));
        }
        if (!req.params.message) {
          return next(new restify.MissingParameterError('You must enter a message.'));
        }
        if (!req.params.subject) {
          return next(new restify.MissingParameterError('You must enter a subject.'));
        }
        var messageThread = new MessageThread(req.params); // why isn't this working??
        messageThread.version = 1;
        messageThread.fromUsername = req.params.fromUsername;
        messageThread.fromUserId = req.session.user;
        messageThread.toUsername = req.params.toUsername;
        messageThread.toUserId = req.params.toUserId;
        messageThread.message = null;
        messageThread.messages = [];
        messageThread.addReply(req.params.fromUsername, req.params.message);
        messageThread.createDate = new Date();
        messageThread.modifyDate = new Date();

        id = req.session.user;
        User.findById(id, function (err, user) {
          if (!err) {
            messageThread.fromUsername = user.username;
            // console.log(JSON.stringify(messageThread));
            messageThread.save(function (err, messageThread) {
              if (!err) {
                res.send({});
              } else {
                return next(err);
              }
            });
          } else {
            var errObj = err;
            if (err.err) errObj = err.err;
            return next(new restify.InternalError(errObj));
          }
        });
      }
   }

   /**
   * Put (Update) a message thread
   *
   * @param request can include an id, a username or no search param
   * @param response
   * @param next method
   */
   function putMessageThread(req, res, next) {
     // how to avoid collisions? Pull a message and check modify date
     // would do this very differently in a relational table
     if (req.session && req.session.user) {
       if (!req.params._id) {
         return next(new restify.MissingParameterError('You must enter a Message Id.'));
       }
       MessageThread.findById(req.params._id, function (err, messageThread) {
         if (!err) {
           var d1 = req.params.modifyDate;
           var d2 = messageThread.modifyDate;
           if (!d1) d1 = d2;
           if (Date.parse(d1) >= Date.parse(d2)) {
             messageThread.fromArchiveFlag = req.params.fromArchiveFlag;
             messageThread.toArchiveFlag = req.params.toArchiveFlag;
             messageThread.inappropriateFlag = req.params.inappropriateFlag;
             messageThread.messages = req.params.messages;
             messageThread.modifyDate = new Date();
             messageThread.save(function (err) {
               if (!err) {
                 res.send({});
                 return next();
               } else {
                 var errObj = err;
                 if (err.err) errObj = err.err;
                 return next(new restify.InternalError(errObj));
               }
             });
           } else {
             // message out of date
             return next(new restify.MissingParameterError('Message thread is out of date. Reload the thread and try again.'));
           }
         } else {
           res.send(err);
         }
       });
     }
   }

   /**
   * Get a message thread
   *
   * @param request filter (optional) by fromUsername, toUsername, archiveFlag if true does not filter out archived
   * @param response array of MessageThreads
   * @param next method
   */
   function getMessageThread(req, res, next) {
      if (req.session && req.session.user) {
        var noArchived = true;
        if (req.params.archiveFlag && req.params.archiveFlag == 'true') noArchived = false;

        // TODO is there a way to make a complex query [(A && B) || (C && D)] ?
        var queryFrom = MessageThread.where('fromUserId', req.session.user);
        var queryTo = MessageThread.where('toUserId', req.session.user);
        if (noArchived) {
          queryFrom = queryFrom.where('fromArchiveFlag', false);
          queryTo = queryTo.where('toArchiveFlag', false);
        }

        queryFrom.exec(function (err, fromResults) {
          if (!err) {
            queryTo.exec(function (err, toResults) {
              if (!err) {
                for (var i = 0; i < toResults.length; i++) {
                  fromResults.push(toResults[i]);
                }
                res.send(fromResults); // TODO how to sort ???
              } else {
                res.send(err);
              }
            });
          } else {
            res.send(err);
          }
        });
      }
     return next();
     /* Something like this: http://stackoverflow.com/questions/13279992/complex-mongodb-query-with-multiple-or/13280188#comment18104912_13280188
    MessageThread.find({
      'fromUserId', req.session.user
      $or: [
          { 'toUserId', req.session.user }
      ]
    }, callback);
     */
   }

   /**
   * Archive a message thread
   *
   * @param request includes messageThreadId
   * @param response
   * @param next method
   */
   function archiveMessageThread(req, res, next) {
        if (req.session && req.session.user) {
          if (!req.params.messageThreadId) {
            return next(new restify.MissingParameterError('You must enter a Message Id.'));
          }
          MessageThread.findById(req.params.messageThreadId, function (err, messageThread) {
             if (!err) {
               if (req.session.user == messageThread.fromUserId) {
                 messageThread.fromArchiveFlag = true;
               }
               if (req.session.user == messageThread.toUserId) {
                 messageThread.toArchiveFlag = true;
               }

               messageThread.save(function (err) {
                 if (!err) {
                    res.send({});
                    return next();
                 } else {
                    var errObj = err;
                    if (err.err) errObj = err.err;
                    return next(new restify.InternalError(errObj));
                 }
              });
           } else {
              return next(new restify.MissingParameterError('ObjectId required.'));
           }
        });
      }
   }

   /**
   * Post a system message
   *
   * @param request include subject and message
   * @param response
   * @param next method
   */
   function postSystemMessage(req, res, next) {
      if (req.session && req.session.user) {
        if (!req.params.message) {
          return next(new restify.MissingParameterError('You must enter a message.'));
        }
        if (!req.params.subject) {
          return next(new restify.MissingParameterError('You must enter a subject.'));
        }
        var systemMessage = new SystemMessage(req.params);
          systemMessage.createDate = new Date();
          systemMessage.fromUserId = req.session.user;

        id = req.session.user;
        User.findById(id, function (err, user) {
          if (!err) {
              systemMessage.fromUsername = user.username;
              systemMessage.save(function (err, systemMessageResult) {
              if (!err) {
                res.send({});
              } else {
                return next(err);
              }
            });
          } else {
            var errObj = err;
            if (err.err) errObj = err.err;
            return next(new restify.InternalError(errObj));
          }
        });
      }
   }

  /**
   * Get a system messages
   *
   * @param request filter (optional) archiveFlag if true includes all
   * @param response array of SystemMessages
   * @param next method
   */
   function getSystemMessage(req, res, next) {
      if (req.session && req.session.user) {

         /* Here's an example where Mongoose/Mongo becomes hard. I'd like to something like this (psuedo SQL, not sure this is correct but give the gist):
            SELECT * FROM SystemMessage A WHERE
              A._id NOT IN (SELECT systemMessageId from SystemMessageArchive B WHERE B.UserId == req.session.user)

            Maybe something like this????
            http://stackoverflow.com/questions/13279992/complex-mongodb-query-with-multiple-or/13280188#comment18104912_13280188

            Maybe look at 'mongoose-joins' module?
         */


          if (req.params.archiveFlag && req.params.archiveFlag == 'true') {
              // skip the archive, retrieve all messages
              filterSystemMessage(req, res, null, next);
         } else {
             // retrieve all the archive flags for this user then filter the
             var query = SystemMessageArchive.where( 'userId', req.session.user );
             query.find(function (err, systemMessageArchive) {
                if (!err) {
                  // console.log(JSON.stringify(systemMessageArchive))
                   filterSystemMessage(req, res, systemMessageArchive, next);
                } else {
                      var errObj = err;
                      if (err.err) errObj = err.err;
                      return next(new restify.InternalError(errObj));
                }
             });
         }

      }
   }
  /**
   * Filter the system messages and return
   *
   * @param request filter (optional) archiveFlag if true includes all
   * @param response array of SystemMessages
   * @param next method
   */
    function filterSystemMessage(req, res, systemMessageArchiveArr, next) {
      SystemMessage.find(function (err, systemMessageArr) {
          if (systemMessageArr) {
            if (systemMessageArchiveArr) {
                // going to be SLOW so admins need to keep the message count low and purge them when done
                for (var i = systemMessageArr.length-1; i >= 0; i--) {
                  for (var j = 0; j < systemMessageArchiveArr.length; j++) {
                      if (systemMessageArr[i]._id.toString() == systemMessageArchiveArr[j].systemMessageId.toString()) {
                        systemMessageArr.splice(i, 1);
                        j = systemMessageArchiveArr.length;
                      }
                  }
                }
            }
            res.send(systemMessageArr);
          } else {
            res.send({});
            return next();
          }
      });
    }
    /**
     * Archive a system messages
     *
     * @param request input systemMessageId
     * @param response
     * @param next method
     */
     function archiveSystemMessage(req, res, next) {
        if (req.session && req.session.user) {
          if (!req.params.systemMessageId) {
            return next(new restify.MissingParameterError('You must enter a System Message Id.'));
          }

          // avoid creating duplicate entries
          // check if user already archived this message
          // this shouldn't be necessary but my test UI allows the user to retry archiving
          // since the overhead of
          var query = SystemMessageArchive.where( 'systemMessageId', req.params.systemMessageId ).where( 'userId', req.session.user );
          query.count(function (err, count) {
            if (!err) {
              if (count === 0) {
                 var systemMessageArchive = new SystemMessageArchive(req.params);
                 systemMessageArchive.userId = req.session.user;
                 systemMessageArchive.save(function (err, systemMessage) {
                  if (!err) {
                    res.send({});
                  } else {
                    return next(err);
                  }
                });
              } else {
                // already archived
                res.send({});
              }
            } else {
              var errObj = err;
              if (err.err) errObj = err.err;
              return next(new restify.InternalError(errObj));
            }
          });

        }
     }

    /**
     * Purge a system messages
     *
     * @param request input systemMessageId
     * @param response
     * @param next method
     */
     function purgeSystemMessage(req, res, next) {
        if (req.session && req.session.user) {
          if (!req.params.systemMessageId) {
            return next(new restify.MissingParameterError('You must enter a System Message Id.'));
          }

          SystemMessage.findById(req.params.systemMessageId).remove(function (err) {
            if (!err) {
                var query = SystemMessageArchive.where( 'systemMessageId', req.params.systemMessageId );
                query.exec(function (err, sysMessageArr) {
                if (!err) {
                   for (var i = 0; i < sysMessageArr.length; i++) {
                     sysMessageArr[i].remove(function (err) { if (err) {console.log(err);}});
                   }
                   res.send({});
                   return next();
                } else {
                   return next(new restify.MissingParameterError('ObjectId required.'));
                }
              });
            } else {
               return next(new restify.MissingParameterError('ObjectId required.'));
            }
          });
        }
     }

     /**
     * Post a message thread
     *
     * @param path
     * @param promised callback check authorization
     * @param promised 2nd callback post
     */
     app.post('/api/v1/messageThread', auth.requiresLogin, postMessageThread);

     /**
     * Update a message thread
     *
     * @param path
     * @param promised callback check authorization
     * @param promised 2nd callback update
     */
     app.put('/api/v1/messageThread', auth.requiresLogin, putMessageThread);

     /**
     * Get a message thread
     *
     * @param path
     * @param promised callback check authorization
     * @param promised 2nd callback update
     */
     app.get('/api/v1/messageThread', auth.requiresLogin, getMessageThread);

     /**
     * Archive a message thread
     *
     * @param path
     * @param promised callback check authorization
     * @param promised 2nd callback update
     */
     app.del('/api/v1/messageThread', auth.requiresLogin, archiveMessageThread);

     /**
     * Post a system message thread
     *
     * @param path
     * @param promised callback check admin access
     * @param promised 2nd callback post
     */
     app.post('/api/v1/systemMessage', auth.adminAccess, postSystemMessage);

     /**
     * Get a message thread
     *
     * @param path
     * @param promised callback check authorization
     * @param promised 2nd callback update
     */
     app.get('/api/v1/systemMessage', auth.requiresLogin, getSystemMessage);

     /**
     * Archive a message thread
     *
     * @param path
     * @param promised callback check authorization
     * @param promised 2nd callback update
     */
     app.del('/api/v1/systemMessage', auth.requiresLogin, archiveSystemMessage);

     /**
     * Deletes a System Message by the administrator
     *
     * @param path
     * @param promised callback check authorization
     * @param promised 2nd callback update
     */
     app.del('/api/v1/systemMessage/delete', auth.adminAccess, purgeSystemMessage);

}
















