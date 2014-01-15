/**
 * Enyo Captcha
 * Need https://github.com/enyojs/canvas.git
 * git submodule add https://github.com/enyojs/canvas.git lib/canvas
 *
 * WARNING: Since Kinetic is being used instead of Enyo to display images, the local path for the images assumes the
 * submodule is in the path /lib/captcha/
 */
enyo.kind({
    name: "tld.CaptchaMain"
    , kind: "enyo.Control"
    , classes: "onyx drawer-sample"
    , generatedSolution : ''
    , handlers: {
        onPuzzleSolved: 'puzzleSolved'
    }
    , published: {
        local: true
        , passed: false
        , solved: false
        , serverUrl: ''
        , callback: null
        , solution: ''
        , radioGroup: null
        , seedValues: []
        , seedKeys: []
        , successDisplayText: 'You appear to be human.'
        , width: 300
        , height: 300
        , maxSeed: 4
    }
    , components: [
        {name: "drawerInstruction", kind: "onyx.Drawer", animated: true, style:'margin-left:10%;margin-bottom:10px;margin-top:10px;', components: [
          {content: "Move the shapes into their matching boxes.", classes: "drawer-sample-box drawer-sample-mtb"}
          , {kind:"onyx.Button", content: "Reset", ontap: "reset"}
        ]}
        , {name: "drawerGraphic", kind: "onyx.Drawer", animated: true, style:'margin-left:10%;', components: [
            { name: "canvas", id: "canvas", kind: "enyo.Canvas",  attributes: { width: this.width, height: this.height }, components:[{kind:'tld.CaptchaGraphicPuzzle', name: 'captchaGraphicPuzzle'}]}
        ]}
        , {name: "drawerText", kind: "onyx.Drawer", open: false, animated: true, style:'margin-left:10%;', components: [
            {kind:'tld.CaptchaTextPuzzle', name: 'captchaTextPuzzle'}
        ]}
        , {name: "drawerComplete", kind: "onyx.Drawer", open: false, animated: true, style:'margin-left:10%;margin-top:10px;', components: [
            {name: 'successDisplayContent', content: '', allowHtml: true, classes: "drawer-sample-box drawer-sample-mtb"}
        ]}
    ]
    , rendered: function() {
        this.inherited(arguments);
        this.randomizeSeedArray();

        this.$.canvas.attributes.width = this.width
        this.$.canvas.attributes.height = this.height

        this.$.canvas.attributes.height = this.height;
        this.$.captchaGraphicPuzzle.displayCaptcha(this.seedValues, this.width, this.height);
        this.$.successDisplayContent.setContent(this.successDisplayText);

/* Turned off for now, having issues with text Captcha inputs
        //  dynamically create the text toggle, for some reason the canvas render interferes
        var toggle = this.createComponent(
          {name: "drawerToggle", kind: "onyx.Drawer", open: true, animated: true, style:'margin-left:10%;', components: [
            {kind: "onyx.RadioGroup", onActivate:"tabActivated", controlClasses: "onyx-tabbutton", components: [
              {content: "Puzzle", active: true, name:'radioButton0'}, {content: "Text", name:'radioButton1'}
            ]}
          ]}
        );
        toggle.render();
        this.$.captchaTextPuzzle.setupCaptcha(this.seedKeys, this.seedValues);
*/
    }
    , localChanged: function(oldValue) {

    }
    , passedChanged: function(oldValue) {

    }
    /**
    * For server mode (localMode == false) reload the cptcha seed data if the url changes (set)
    */
    , serverUrlChanged: function(oldValue) {
        // load data and render
    }
    , solutionChanged: function(oldValue) {
        this.setPassed(this.getSolution() == this.$.generatedSolution);
    }
    , activateDrawer: function(displayVal) {
        if (displayVal == 0) {
          this.$.drawerGraphic.setOpen(true);
          this.$.drawerText.setOpen(false);
          this.$.drawerInstruction.setOpen(true);
          this.$.drawerComplete.setOpen(false);
          this.$.drawerToggle.setOpen(true);
        } else if (displayVal == 1) {
          this.$.drawerGraphic.setOpen(false);
          this.$.drawerText.setOpen(true);
          this.$.drawerInstruction.setOpen(false);
          this.$.drawerComplete.setOpen(false);
          this.$.drawerToggle.setOpen(true);
        } else if (displayVal == 2) {
          this.$.drawerGraphic.setOpen(false);
          this.$.drawerText.setOpen(false);
          this.$.drawerInstruction.setOpen(false);
          this.$.drawerComplete.setOpen(true);
        }
    }
    /**
    * For local mode this has been solved and the containing app needs to subscribe to the onPuzzleSolved event
    * For server side the solution gets passed back tot eh server for validation against the generated values.
    * Not real secure in either case, hackable with access to the JavaScript console, but will stop basic robots in either case
    */
    , puzzleSolved: function(inSender, inEvent) {
        this.solution = inEvent.data;
        if (this.local) {
            this.solved = true;
            this.activateDrawer(2);
        } else {
        }
    }
    /**
    * Had a text version, might still use it. The User sees letters next tot he number sets and enters the letters in the proper
    * order. Letters are generated randomly.
    */
    , randomizeSeedArray: function() {
        this.seedValues = [];
        this.seedKeys = [];
        var alpha = 'ABCDEFGHJKLMNPQRSTUVWXYZ'; // remove I and O, can be confusing
        for (var i = 0; i < this.maxSeed; i++) {
          this.seedValues.push(Math.floor((Math.random()*75)+30));
          this.seedKeys.push(this.nextKey(alpha));
        }
    }
    , nextKey: function(alpha) {
        var key = '';
        while (key == '') {
          var pos = Math.floor((Math.random()*alpha.length));
          key = alpha[pos];
          for (var i = 0; i < this.seedKeys.length; i++) {
            if (key == this.seedKeys[i]) key = '';
          }
        }
        return key;
    }
    /**
    * Resets the captcha
    */
    , reset: function() {
        this.solved = false;
        this.randomizeSeedArray();
        this.$.captchaGraphicPuzzle.displayCaptcha(this.seedValues, this.width, this.height);
    }
    , tabActivated: function(inSender, inEvent) {
        if (inEvent.originator.getActive()) {
          if ("radioButton0" == inEvent.originator.getName()) {
            this.activateDrawer(0);
          } else if ("radioButton1" == inEvent.originator.getName()) {
            this.activateDrawer(1);
          }
        }
    }
});

