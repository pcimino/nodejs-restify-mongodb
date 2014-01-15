/**
 * Canvas implementation of Line
 */
var gGraphicThis = null;

enyo.kind({
	name: "tld.CaptchaGraphicPuzzle"
  , kind:"enyo.canvas.Shape"
  , nodeTag: "canvas"
  , published: {
      localMode: true
      , serverURL: ''
      , ctx : null
  }
  , renderSelf: function(ctx) {
      this.inherited(arguments);
      gGraphicThis = this;
      this.ctx = ctx;
  }
  , validateSolution: function(result) {
      if (result == gResult) {
        gGraphicThis.bubble('onPuzzleSolved', {data: result});

        /* Need to figure out why these don't work for dynamically created components
          gGraphicThis.bubble('onPuzzleSolved', {data: result});
          gGraphicThis.bubbleUp('onPuzzleSolved', {data: result});
          gGraphicThis.getParent().bubble('onPuzzleSolved', {data: result});
          gGraphicThis.getParent().bubbleUp('onPuzzleSolved', {data: result});
        */
      }
  }
  , displayCaptcha: function(seedArray, width, height) {
      gGraphicThis.ctx.clearRect(0, 0, width, height);
      buildCaptcha(gGraphicThis.ctx, gGraphicThis.getParent().getContainer().getId(), seedArray, gGraphicThis.validateSolution, width, height);
  }

});



