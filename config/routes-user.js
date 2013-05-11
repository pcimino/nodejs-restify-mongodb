// NOTE : All of these routes are exposed (unprotected) See routes-auth.js for examples of authorized routes

var mongoose = require('mongoose')
  , User = mongoose.model('User')
  , UserList = mongoose.model('UserList')
  , restify = require('restify');

var mail = {};

module.exports = function (app, config, auth, mailHelper) {
   mail = mailHelper;

   // This function is responsible for searching and returning multiple users
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
                  return next(new restify.InternalError(err));
               }
            });
         } else {
            return next(new restify.InternalError(err));
         }
      });
     return;
   }

   // Search by ID or username
   function getUser(req, res, next) {
      if (req.params.id != null && req.params.id != '') {
         getUserById(req, res, next);
      } else if (req.params.username != null && req.params.username != '') {
          getUserByUsername(req, res, next)
      } else if (req.session && req.session.user) {
        getUserById(req, res, next);
      } else {
        return next(new restify.MissingParameterError('No search params sent.'));
      }
   }
   // Search by ID, if none provide search for the logged in user's info
   function getUserById(req, res, next) {
     var id = req.params.id;
     if (!req.params.id) {
       if (req.session && req.session.user) {
         id = req.session.user;
       }
     }
      if (id) {
         User.findById(id, function (err, user) {
            if (!err) {
              res.send(user);
              return next();
            } else {
              return next(new restify.InternalError(err));
            }
         });
      } else {
         return next(new restify.MissingParameterError('ObjectId required.'));
      }
   }

   // Search by Username
   function getUserByUsername(req, res, next) {
      if (req.params.username != null && req.params.username != '') {
         var query = User.where( 'username', new RegExp('^'+req.params.username+'$', 'i') );
         query.findOne(function (err, user) {
            if (!err) {
               if (user) {
                  res.send(user);
               } else {
                  res.send(new restify.MissingParameterError('User not found.'));
               }
            } else {
              return next(new restify.InternalError(err));
            }
         });
      } else {
         return next(new restify.MissingParameterError('Username required.'));
      }
   }

    // Find a user and modify, then save it
   function putUser(req, res, next) {
      User.findById(req.params.id, function (err, user) {
         if (!err) {
            user.name = req.params.name;
            user.username = req.params.username;
            user.email = req.params.email;
            user.role = req.params.role;
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
            }
            if (req.params.password) {
              user.password = req.params.password;
            }
            user.save(function (err) {
               if (!err) {
                  // console.log("updated");
                  res.send(user);
                  return next();
               } else {
                  return next(new restify.InternalError(err));
               }
            });
         } else {
            return next(new restify.MissingParameterError('ObjectId required.'));
         }
      });
   }

   // Delete the user
   function deleteUser(req, res, next) {
      User.findById(req.params.id).remove(function (err) {
        if (!err) {
         res.send({});
         return next();
        } else {
         return next(new restify.MissingParameterError('ObjectId required.'));
        }
      });
   }


   // Set up routes

   // I looked at versioning via header. Lots of arguments pro/con regarding different types of versioning
   // I like the embedded version (self documenting) so stuck with that instead
   // apt.get({path: 'api/user:id', version: '1.0.0'}, getUser_V1);
   // apt.get({path: 'api/user:id', version: '2.0.0'}, getUser_V2);


   // Read
   app.get('/api/v1/userlist', auth.requiresLogin, searchUsers);

   // TODO Need to figure out the explicit REST URI
   // confused, specified gets by id or username, seemed to be working
   // then started getting 405 GET not allowed ??
   //       app.get('/api/v1/user/:id', getUserById);
   //       app.get('/api/v1/user/:username', getUserByUsername);
   // so went back to a generic path
   app.get('/api/v1/user', auth.requiresLogin, getUser);


   // Update
   app.put('/api/v1/user', auth.requiresLogin, putUser);

   // Delete
   // 405 ? app.del('/api/v1/user/:id', deleteUser);
   app.del('/api/v1/user', auth.adminAccess, deleteUser);
}
