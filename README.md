# Node+Mongoose+Restify #

This is a basic Node.js setup demonstrating:

- Mongo integration using Mongoose model objects
- Restify CRUD operations
- Basic (crude) session id via cookie
- Static content

## ***Recent Changes*** ##

#### ***Enyo Demonstration App*** ####
I'm working on another project using Enyo MVC. The minified version of this app is included as part of the demo. Once you load the index.html, click on the Enyo link.

#### ***Username or Password*** ####
Implementing the ability to login with username or email address. This involves enforcing uniqueness on these fields. So you may need to wipe or fix your data manually. To simplify this, email and username will also be stored in lowercase to avoid user confusion.

#### ***IP Range Checking*** ####

Added IP Range Checking on Admin methods, see the config.js for setting ranges

## Quick Start ##
If you're new to Node.js and/or Mongo DB, these steps will get you started. Advanced users may want to look at the start-node.bat script and configure it for their environment. *nix shell scripts are also included, run `chmod 755 *.sh` if needed.

1. Download/clone this project
2. [Install MongoDB](http://docs.mongodb.org/manual/installation/#gsc.tab=0).
3. [Install Node.js](http://nodejs.org/download/).
4. Setup an environment variable MONGODB pointing to the install directory, if you want to use the included scripts.
5. Run the **create-db.bat/.sh** which creates a directory structure for the test database.
6. Run the **install-modules.bat/.sh** to install the required Node.js modules.
7. Start the Mongo database: **start-mongo.bat/.sh**
8. Start the Node.js server: **start-node.bat/.sh**
0. Point your browser to [http://localhost:3000](http://localhost:3000)

[The demo page loads and you can use the forms to call the REST APIs.](https://github.com/pcimino/nodejs-restify-mongodb/wiki/APITest)

The **stop-mongo.bat/.sh** scripts shutdown the database server in an orderly fashion. Interrupting the process can lock and even corrupt the database. For this demo you can always delete the lock file and the contents of **%MONGODB%\data\db** (**$MONGODB/data/db**) but it is recommened to simply shut things down properly.

## [Detailed Walk Through](https://github.com/pcimino/nodejs-restify-mongodb/wiki) ##
[See the wiki here.](https://github.com/pcimino/nodejs-restify-mongodb/wiki) There are a number of TODOs where I want to do something different but haven't figured it out yet. And notes where I want to do a little more research a little more before I'm convinced that my implementation is appropriate or even suitable.

The wiki is (hopefully) a coherent walk through, combined with notes in the code to help those that follow along.

## Purpose ##
My web background is mostly Java and Java frameworks like Spring. I've done a little Node.js and functional JavaScript before, but to really dive in I wanted to create a Node.js RESTful API project that's easy to understand and reuse. So I wanted to:
- Configure a server with a REST api
- That connects to a Mongo database
- And provides some form of authentication/authorization
- And a way to serve static pages to demonstrate the APIs
- Create something that can be used as a backend for my next project using [MVC project](https://github.com/enyojs/enyo/wiki/Enyo-MVC-Intro)

[This example was extremely helpful](http://pixelhandler.com/blog/2012/02/09/develop-a-restful-api-using-node-js-with-express-and-mongoose/). In fact if all I wanted to do was setup a Node.js server I'd be done. But copying something wholesale doesn't help me learn about the underlying technology.

I also decided to go with Restify instead of Express (briefly looked at PerfectAPI which looks interesting). If I want to focus on REST then maybe Restify would be a little stricter and have less overhead? That's a question, since this isn't an opinion but an uneducated hunch on my part.

I looked at Everyauth and Passport. I decided on Passport, and after implementing code that looks suspiciously like [Bill Heaton's example](http://pixelhandler.com/blog/2012/02/09/develop-a-restful-api-using-node-js-with-express-and-mongoose/), I rolled back and removed it. Not because Passport isn't excellent, but because the stateless nature of Restify means I have to think about how to figure out if a request is truly authenticated or not.

## Cookie Authentication ##
For this demo, the user authenticates and the object id is placed in a cookie. This is *completely not secure*. Nothing is encrypted, etc, only for demo purposes. You should be able to create a user, take the ObjectId, and create a cookie 'session-id' with the value of the Object Id, and then the Login page will treat them as if they already logged in.

Authentication, whether using Passport or something else, is probably the next step in this project.

## (Non)Secure Server ##
Ha! This is a demo where everything runs on localhost. Not https, certificates or even clustered MongoDB instances. And the "Session" sis nothing more than the user's dtabase id stored in a cookie.

But I do discuss bits and pieces about where you can find info and how I'd like to approach longer term solutions.

## Resources ##
**Primary**
- [Node.js](http://nodejs.org/)
- [Mongo DB](http://www.mongodb.org/)
- [Restify](http://mcavage.github.com/node-restify)
- [Mongoose](http://mongoosejs.com/)
- [Cookies](http://https://github.com/jed/cookies)
- [JQuery](http://api.jquery.com/)

**Secondary/Tutorials/Threads**
- [Creating a REST API using Node.js, Express, and MongoDB](http://coenraets.org/blog/2012/10/creating-a-rest-api-using-node-js-express-and-mongodb/)
- [Node.js and MongoDB](http://howtonode.org/node-and-mongo)
- [Node Cellar Sample Application](https://github.com/ccoenraets/nodecellar)
- [Simple example - Node.js, Restify, MongoDb and Mongoose](http://backbonetutorials.com/nodejs-restify-mongodb-mongoose/)
- [test-restify-passport-facebook](https://github.com/halrobertson/test-restify-passport-facebook/)
- [Node.js knockout: Restify](http://blog.nodeknockout.com/post/34710903021/restify)
- [Node.js Development with the MongoDB Service](http://docs.cloudfoundry.com/services/mongodb/nodejs-mongodb.html)
- [Case insensitive Mongoose Search](https://fabianosoriani.wordpress.com/2012/03/22/mongoose-validate-unique-field-insensitive/)


# Tags
##FinalDemo
Stable demonstrator.
##Promise
Included the Promises Q npm module in preparation of rewriting some of the asynchronous dependent calls to use promises.




