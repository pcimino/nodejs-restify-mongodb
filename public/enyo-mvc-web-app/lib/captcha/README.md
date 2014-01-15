Enyo Captcha
=============
## What's a Captcha?
Just in case you don't know, a captcha is a tool to try and prevent automated programs (robots) from accessing websites. This often take the form of an image or images containing obfuscated text designed to prevent OCR software form reading the text. You've probably seen something like this:

<img src="http://0.tqn.com/d/netforbeginners/1/0/s/O/CAPTCHA1.png"> 

Enyo Captcha presents the user with a drag and drop interface, which hopefully, most web robots haven't figured out yet. It's rough but here's an example:

<img src="https://raw2.github.com/pcimino/gallery/gh-pages/gallery_images/tld.Captcha.jpg" >

The user drags the squares into the matching empty box (color and approx size). Once the target is in the box it locks in place. After all boxes are locked, the puzzle is solved.

# Known Issues
## Text Version
There is a text version that presents the user with sets of numbers which they enter in the appropiate order. A toggle button will be presented and the user can choose which puzzle to use. That isn't working yet.

##Server Mode
If and when complete it [will integrate with this project](https://github.com/pcimino/nodejs-restify-mongodb), and the client won't have control over determining if the puzzle was successfully unlocked. A generated code will be sent with a form submission which has to match the generated code on the server.

##Events
Seem to be an issue with events bubbling up (or failing to). Works fine if you use the component statically, but dynamically created components seem to get lost.

## Work in progress
The concept is to let the user solve a simple graphical puzzle instead having them try and interpret images containing distorted text.

## Security
Not a truly secure captcha. If a developer has access to the JavaScript console they can figure out how to solve the captcha. A future enhancement with the seed and validation on the server side will be a bit more secure, but still decipherable. At any rate it's a start to slow down the robots.

## Limited use
Not sure how much use this has in a mobile app. I developed this because I'm working on an Enyo based turnkey web template. [Which you can get here](https://github.com/pcimino/enyo-mvc-web-app).

You can also see the captcha on [JSFiddle here](http://jsfiddle.net/pcimino/YqKdz/](http://jsfiddle.net/pcimino/YqKdz/).

# Enyo Kind for including a Captcha
This captcha is a simple graphical puzzle (puzzle is overstatement) requiring some shape dragging.

This captcha provides two authentication modes: local and server.

In local mode the captcha is very hackable by anyone with a JavaScript console (e.g. running Enyo in Chrome).

In server mode (TBD), the module makes a call to a server

## Example of local mode here:
[http://jsfiddle.net/pcimino/YqKdz/](http://jsfiddle.net/pcimino/YqKdz/)

## Implementing
In Enyo, instantiate the kind with optional arguments. The parent class can implement a listener for the event, or query the object for its status.

> {kind: 'enyo.Controller',
components: [{kind: tld.Main, successDisplayText: 'Congratulations!', width:300, height:300}]}

## NOTES
###Server Mode
Server mode is planned, but not yet implemented.
###Text Mode
There are some fragments in the code suggesting a text input instead of the graphic puzzle. There is a future enhancement planned to give the user the option to input text instead of using the draggable UI.

## Settings
### Local
Set to true, runs in local mode, false runs in server mode.

### Server Host
Required if running in server mode.

### onPuzzleSolved
Subscribe to this event which gets bubbled up when the puzzle is solved.

## Validation
### Local mode
In local mode, the instance sets the "passed" attribute to true. onPuzzleSolved event gets generated. It's up to the client to allow/prevent form submission.

### Server mode (Future enhancement)
When the instance starts up it queries the server for image URLs to load. The server is responsible for the following actions:
1. Select 4 (maybe configurable in the future) random numbers.
2. Generate the expected result from these numbers and store the result in a secure location.
3. Return the list of numbers which are used to generate the solution.

# Implementing



# Text Puzzle Mode
Planned, in progress, some issues, so it's turned off.

