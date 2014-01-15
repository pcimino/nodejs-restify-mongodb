/**
* Text implementation of captcha puzzle
* Not ideal for lots of reasons, the most glaring is the hardcoded length of 4 elements
* Need to create an array of components and add them dynamically
*/
enyo.kind({
  name: "tld.CaptchaTextPuzzle"
  , kind: "enyo.Control"

  , published: {
      localMode: true
      , serverURL: ''
      , solutionArr: []
      , keyArr: []
      , arraySuffix: ['A', 'B', 'C', 'D']
      , inputArr: ['', '', '', '']
  }
  , components: [
    {content: "Each letter corresponds to a number.", classes: "drawer-sample-box drawer-sample-mtb"}
    , {content: "Enter the letter, in order of least to greatest number.", classes: "drawer-sample-box drawer-sample-mtb", style:'margin-bottom:10px;'}
    , {content: ".", name: 'valueA'}
    , {content: ".", name: 'valueB'}
    , {content: ".", name: 'valueC'}
    , {content: ".", name: 'valueD', style:'margin-bottom:10px;'}
    , {kind: "onyx.Input", name: 'inputA', placeholder: "Letter of smallest number", onkeypress: "checkKeyA"}
    , {kind: "onyx.Input", name: 'inputB', onchange:"inputChanged"}
    , {kind: "onyx.Input", name: 'inputC', onchange:"inputChanged"}
    , {kind: "onyx.Input", name: 'inputD', placeholder: "Letter of largest number", onchange:"inputChanged"}
  ]
  , setupCaptcha: function(keys, values) {
      this.keyArr = keys;
      this.solutionArr = values;
      for (var i = 0; i < keys.length; i++) {
        var comps = this.getComponents();
        var elem = 'value' + this.arraySuffix[i];
        for (var j = 0; j < comps.length; j++) {
            if (comps[j].getName() == elem) {
              comps[j].setContent(keys[i] + ": " + values[i]);
            }
        }
      }
  }
  , validateSolution: function(result) {

   //     gGraphicThis.bubble('onPuzzleSolved', {data: result});

  }
  , legalKey: function(val) {
      var legal = 'ABCDEFGHJKLMNPQRSTUVWXYZ'; // should be coming from parent
      if (legal.indexOf(val) >= 0) {
        return true;
      }
      return false;
  }
  , checkKeyA: function(inSender, inEvent) {
      var keyCode = inEvent.keyCode;
    console.log(keyCode)
      if ((keyCode >= 65 && keyCode <= 90) || (keyCode >= 97 && keyCode <= 122)) {
        this.inputArr[0] = (String.fromCharCode(keyCode)).toUpperCase();
        this.$.inputA.setValue(this.inputArr[0]);
        this.$.inputA.render();
        return true;
      } else {
        this.$.inputA.setValue('');
        this.$.inputA.render();
        return false;
      }
  }
  , inputChanged: function(inSender, inEvent) {
    console.log('inputChanged ' + inSender.getValue() +":",(inSender))
      var inputVal = ('' + inSender.getValue()).toUpperCase();

      for (var i = 0; i < this.arraySuffix.length; i++) {
        var elem = 'input' + this.arraySuffix[i];
        if (inSender.getName() == elem) {
          this.inputArr[i] = inputVal;
        }
      }
  }
  , check: function() {
		  var enteredValue = '';
      for (var i = 0; i < this.arraySuffix.length; i++) {
        var comps = this.getComponents();
        var elem = 'input' + this.arraySuffix[i];
        for (var j = 0; j < comps.length; j++) {
            if (comps[j].getName() == elem) {
              console.log(elem)
              enteredValue = enteredValue + comps[j].getValue();
            }
        }
      }


      // localMode
      // solve the puzzle and compare. In reality this should be on the server side
      // and only checked upon form submission
      // start with bubble sort
      var checkArr = this.solutionArr;
      for (var i = 0; i < checkArr.length - 1; i++) {
        for (var j = 1; j < checkArr.length; j++) {
          if (i < j) {
            if (checkArr[j] < checkArr[i]) {
              var swap = checkArr[j];
              checkArr[j] = checkArr[i];
              checkArr[i] = swap;
            }
          }
        }
      }
      var soln = '';
      for (var i = 0; i < checkArr.length; i++) {
        soln = soln + checkArr[i];
      }
    console.log(enteredValue +":" + soln)
	}
});


