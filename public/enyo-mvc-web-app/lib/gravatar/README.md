Enyo Gravatar
=============

# Enyo Kind for including a Gravatar

https://en.gravatar.com Provides users a place to store images, and link them to an email address. To use the image, you need to create a link consisting of the user's email address in MD5 hash format.

tld.Gravatar provides an enyo.Image kind setup to build the hash.

## Example here:
http://jsfiddle.net/pcimino/VBNSM/

## Settings
### Email
The registerd email address linked to the Gravatar

Default image is the Gravatar logo.

### src
The Image source, gets built from the email address when rendered. 

### imageSize
Default is 50. Valid range in pixels is 1 to 2048.

### rating
Gravatar allows users to rate their images in terms of ausience appropriateness
 - g : General audience
 - pg : Parental Guidance
 - r : NSFW
 - x : REALLY NSFW

