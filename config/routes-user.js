// NOTE : All of these routes are exposed (unprotected) See routes-auth.js for examples of authorized routes

var mongoose = require('mongoose')
  , User = mongoose.model('User')
  , UserList = mongoose.model('UserList')
  , restify = require('restify');
  
var mailHelper = {};

module.exports = function (app, config, smtpTransport) {
   mailHelper.transport = smtpTransport;
    mailHelper.mailSettings = config.mailSettings;

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
   
   // Create a new user model, fill it up and save it to Mongodb
   function postUser(req, res, next) {
      var user = new User(req.params);
      if (user.username != null && user.username != '') {
         user.save(function (err, user) {
            if (!err) {
               mailHelper.transport.sendMail({from : mailHelper.mailSettings.mailFrom, to : user.email, subject : 'test subject', text : 'test text'}, function(error, response){
                   if (error) {
                       console.log(error);
                   } else {
                       console.log("Message sent");
                       // preview doesn't get a response
                       if (response && response.message) {
                        console.log(response.message);
                       }
                   }
                });
               res.send(user);
               return next();
            } else {
               return next(err);
            }
         });
      } else {
         return next(new restify.MissingParameterError('Username required.'));
      }
   }
   
   // Search by ID or username
   function getUser(req, res, next) {
      if (req.params.id != null && req.params.id != '') {
         getUserById(req, res, next);
      } else {
         if (req.params.username != null && req.params.username != '') {
            getUserByUsername(req, res, next)
         } else {
            return next(new restify.MissingParameterError('No search params sent.'));
         }
      }    
   }
   // Search by ID
   function getUserById(req, res, next) {
      if (req.params.id != null && req.params.id != '') {
         User.findById(req.params.id, function (err, user) {
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

   // Search for existing username
   // based on this post
   //    https://fabianosoriani.wordpress.com/2012/03/22/mongoose-validate-unique-field-insensitive/
   // I probably should be using the validator the way it's demonstratated but for now I'm just borrowing the query
   function checkUsername(req, res, next) {
      if (req.params.username != null && req.params.username != '') {
         var query = User.where( 'username', new RegExp('^'+req.params.username+'$', 'i') );
         query.count(function(err, count) {
            if (!err) {
               if (count === 0) {
                  res.send({});
                  return next();
               } else {
                  return next(new restify.InternalError('Username already in use.'));
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
   
   
   // Create
   app.post('api/v1/user', postUser);
   
   // Read
   app.get('/api/v1/user/username/exists', checkUsername);
   app.get('/api/v1/userlist', searchUsers);
   
   // TODO Need to figure out the explicit REST URI 
   // confused, specified gets by id or username, seemed to be working
   // then started getting 405 GET not allowed ??
   //       app.get('/api/v1/user/:id', getUserById);
   //       app.get('/api/v1/user/:username', getUserByUsername);
   // so went back to a generic path
   app.get('/api/v1/user', getUser);
   

   // Update
   app.put('/api/v1/user', putUser);

   // Delete
   // 405 ? app.del('/api/v1/user/:id', deleteUser);
   app.del('/api/v1/user', deleteUser);

}
