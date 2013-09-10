/**
* Security Utility code function(s)
*/

var mongoose = require('mongoose')
  , User = mongoose.model('User')
  , ObjectId = mongoose.Types.ObjectId;

module.exports = function (globalUtil, config, auth) {

  /**
   * Helper method to generate a new password
   * Only included characters/numbers that will avoid confusion. i.e certain fonts using 0/O or 1/l can be visually ambiguous
   */
  globalUtil.generatePassword = function() {
      var text = "";
      var possible = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefhjlxyz2456789";

      for( var i=0; i < 10; i++ )
          text += possible.charAt(Math.floor(Math.random() * possible.length));
      return text;
  };

}






