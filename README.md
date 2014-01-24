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

## Quick Start
[Get started here.](https://github.com/pcimino/nodejs-restify-mongodb/wiki/Quick-Setup)

## Detailed Walk Through  
[See the wiki here.](https://github.com/pcimino/nodejs-restify-mongodb/wiki) There are a number of TODOs, but haven't figured everything out yet. 

The wiki is (hopefully) a coherent walk through, combined with notes in the code to help those that follow along.

## Purpose ##
[Purpose](wiki/Purpose), aka "What is this project good for?"

Authentication, whether using Passport or something else, is probably the next step in this project.

## (Non)Secure Server ##
This is a demo where everything runs on localhost. Not https, certificates or even clustered MongoDB instances. And the "Session" is nothing more than the user's database id stored in a cookie.

But I do discuss bits and pieces about where you can find info and how I'd like to approach longer term solutions.

## Resources ##






