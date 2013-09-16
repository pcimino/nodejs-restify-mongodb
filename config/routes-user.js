/**
* User Routes module
*    these routes require authenticated users
*/
var mongoose = require('mongoose')
  , User = mongoose.model('User')
  , UserList = mongoose.model('UserList')
  , VerifyCode = mongoose.model('VerifyCode')
  , ObjectId = mongoose.Types.ObjectId
  , restify = require('restify');

var mail = {};

module.exports = function (app, config, auth, mailHelper) {
   mail = mailHelper;

  /**
   * This function is responsible for searching and returning multiple users
   *
   * @param request includes the fields to create a UserList object
   * @param response contains a populated UserList object
   * @param next method
   */
   function searchUsers(req, res, next) {
      var userList = new UserList(req.params);

      var pageNum = userList.pageNumber;
      var itemsPerPage = userList.itemsPerPage;

      if (itemsPerPage <= 0 || pageNum <= 0) {
         itemsPerPage = 999999999999;
         pageNum = 1;
      }
      pageNum = pageNum - 1;

      User.count({}, function(err, count) {
           if (!err) {
            userList.pageCount = Math.ceil(count / itemsPerPage);

         var sortStr = "";
         if (userList.sortField != null && userList.sortField != '') {
            if ('false' === userList.ascendingSortFlag) {
               sortStr = "-" + userList.sortField;
            } else {
               sortStr = userList.sortField;
            }
         }

        // NOTE This sort query is really inefficient, always queries the three columns
        var query = User.find({ username: { $regex: userList.username, $options: 'imx' }, name: { $regex: userList.name, $options: 'imx' }, email: { $regex: userList.email, $options: 'imx' } });

         if (sortStr.length > 0) {
            query = query.sort(sortStr)
         }
         if (itemsPerPage > 0) {
            query = query.limit(itemsPerPage).skip(itemsPerPage * pageNum);
         }
         query.exec(function(err, users) {
               if (!err) {
                  userList.users = users;
                  res.send(userList);
                  return next();
               } else {
                  var errObj = err;
                  if (err.err) errObj = err.err;
                  return next(new restify.InternalError(errObj));
               }
            });
         } else {
                  var errObj = err;
                  if (err.err) errObj = err.err;
                  return next(new restify.InternalError(errObj));
         }
      });
     return;
   }

  /**
   * Gateway request routes to other functions based on params
   * Search for a user by id or username
   * if none given get the logged in user's information
   *
   * @param request can include an id, a username or no search param
   * @param response contains a populated User object
   * @param next method
   */
   function getUser(req, res, next) {
      if (req.session && req.session.user) {
        id = req.session.user;
         User.findById(id, function (err, user) {
            if (!err) {
              res.send(user);
              return next();
            } else {
                  var errObj = err;
                  if (err.err) errObj = err.err;
                  return next(new restify.InternalError(errObj));
            }
         });
      } else {
        return next(new restify.MissingParameterError('No search params sent.'));
      }
   }


  /**
   * Search for a user by id or username
   *
   * @param request path includes an id or username
   * @param response contains a populated User object
   * @param next method
   */
   function getUserByIdOrUsername(req, res, next) {
     var search = req.url;
     search = search.substring(search.lastIndexOf("/")+1);
      if (search != null && search != '') {
         var query = User.where( 'username', new RegExp('^'+search+'$', 'i') );
         query.findOne(function (err, user) {
            if (!err) {
               if (user) {
                  res.send(user);
               } else {
                 User.findById(search, function (err, user) {
                    if (!err) {
                      res.send(user);
                    } else {
                      res.send(new restify.MissingParameterError('User not found.'));
                    }
                    return next();
                 });
               }
            } else {
                  var errObj = err;
                  if (err.err) errObj = err.err;
                  return next(new restify.InternalError(errObj));
            }
         });
      } else {
         return next(new restify.MissingParameterError('Username or ID required.'));
      }
   }

  /**
   * Modify an existing user with matching id
   *
   * @param request
   * @param response
   * @param next method
   */
   function putUser(req, res, next) {
      User.findById(req.params.id, function (err, user) {
         if (!err) {
            // only change data if submit supplied it
            if (req.params.name) {
              user.name = req.params.name;
            }
            if (req.params.username) {
              user.username = req.params.username;
            }
            if (req.params.role) {
              user.role = req.params.role;
            }

            // validations
            if (req.params.email) {
              if (!mail.validateEmail(req.params.email)) {
                 return next(new restify.MissingParameterError('Please enter a valid email address.'));
              } else {
                user.newEmail = req.params.email;
              }
            }
            if (req.params.password) {
              if (req.params.password != req.params.vPassword) {
                return next(new restify.MissingParameterError('Password and Verify Password must match.'));
              }
              if (req.params.password && !req.params.cPassword) {
                return next(new restify.MissingParameterError('You must enter your current password to verify.'));
              }
              if (req.params.cPassword) {
                if (!user.authenticate(req.params.cPassword)) {
                  return next(new restify.MissingParameterError('You must enter your current password to verify.'));
                }
                user.tempPasswordFlag = true;
                user.password = req.params.password;
              }
            }

            user.save(function (err) {
               if (!err) {
                  res.send(user);

                 // generate and send a verification code
                  if (user.newEmail) {
                     // TODO When messaging is available, add a system message to the user telling them to check their email to verify the email address
                     mail.generateVerifyCodeUpdatedEmail(req, res, next, user);
                  }
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

  /**
   * Delete an existing user with matching id
   *
   * @param request
   * @param response
   * @param next method
   */
   function deleteUser(req, res, next) {
     if (req.session && req.session.user) {
       if (req.session.user == req.params.id) {
         return next(new restify.InvalidArgumentError('User cannot delete themselves.'));
       }
        User.findById(req.params.id).remove(function (err) {
          if (!err) {
           res.send({});
           return next();
          } else {
           return next(new restify.MissingParameterError('ObjectId required.'));
          }
        });
      }
   }


   // Set up routes

   // I looked at versioning via header. Lots of arguments pro/con regarding different types of versioning
   // I like the embedded version (self documenting) so stuck with that instead
   // apt.get({path: 'api/user:id', version: '1.0.0'}, getUser_V1);
   // apt.get({path: 'api/user:id', version: '2.0.0'}, getUser_V2);


   /**
   * Search for users
   *
   * @param path
   * @param promised callback check authorization
   * @param promised 2nd callback searches for users
   */
   app.get('/api/v1/userlist', auth.requiresLogin, searchUsers);

   // TODO Need to figure out the explicit REST URI
   // confused, specified gets by id or username, seemed to be working
   // then started getting 405 GET not allowed ??
   //       app.get('/api/v1/user/:id', getUserById);
   //       app.get('/api/v1/user/:username', getUserByUsername);
   // so went back to a generic path
   /**
   * Search for users
   *
   * @param path
   * @param promised callback check authorization
   * @param promised 2nd callback gets user
   */
   // This one is takes no args/params and is for the client to retrieve the authenticated user's information
   app.get('/api/v1/user', auth.requiresLogin, getUser);

   // get the user by id or username, only admin can do this
   app.get('/api/v1/user/:search', auth.adminAccess, getUserByIdOrUsername);


   /**
   * Update user information
   *
   * @param path
   * @param promised callback check authorization
   * @param promised 2nd callback searches for users
   */
   app.put('/api/v1/user', auth.requiresLogin, putUser);

   // Delete
   // 405 ? app.del('/api/v1/user/:id', deleteUser);
   /**
   * delete a user
   *
   * @param path
   * @param promised callback check Administrator auth
   * @param promised 2nd callback deletes
   */
   app.del('/api/v1/user', auth.adminAccess, deleteUser);
}









