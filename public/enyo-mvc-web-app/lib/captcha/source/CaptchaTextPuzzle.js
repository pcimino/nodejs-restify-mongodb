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
    , {kind: "onyx.Input", name: 'inputA', placeholder: "Letter of smallest number", onkeyup: "legalKey"}
    , {kind: "onyx.Input", name: 'inputB', onchange:"inputChanged", onkeyup: "legalKey"}
    , {kind: "onyx.Input", name: 'inputC', onchange:"inputChanged", onkeyup: "legalKey"}
    , {kind: "onyx.Input", name: 'inputD', placeholder: "Letter of largest number", onkeyup: "legalKey"}
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
  , legalKey: function(inSender, inEvent) {
      var legal = 'ABCDEFGHJKLMNPQRSTUVWXYZ'; // should be coming from parent
      if (inSender.getValue().length == 1 && legal.indexOf(inSender.getValue().toUpperCase()) >= 0) {
        inSender.setValue(inSender.getValue().toUpperCase());
        var checkFlag = 0;
        for (var i = 0; i < this.arraySuffix.length; i++) {
          var elem = 'input' + this.arraySuffix[i];
          if (inSender.getName() == elem) {
            for (var j = 0; j < this.keyArr.length; j++) {
              if (this.keyArr[j] == inSender.getValue()) {
                this.inputArr[i] = this.solutionArr[j];
              }
            }
          }
          if (this.inputArr[i] && this.inputArr[i] > 1) checkFlag++;
        }
        if (checkFlag >= this.inputArr.length) {
          this.validateSolution();
        }
        return true;
      } else if (inSender.getValue().length > 1) {
        inSender.setValue(inSender.getValue().toUpperCase()[0]);
      } else {
        inSender.setValue('');
      }

      inEvent.preventDefault(); // not working, shouldn't have to do the else if{} else {} conditions
      return false;
  }
  , compareNumbers: function(x, y) {
      if (x < y) return -1;
      if (y < x) return 1;
      return 0;
  }
  , validateSolution: function() {
      // localMode
      // solve the puzzle and compare. In reality this should be on the server side
      // and only checked upon form submission
      // start with bubble sortr
      var checkArr = this.solutionArr;
      checkArr.sort(this.compareNumbers)

      var solved = true;
      var solution = "";
      for (var i = 0; i < checkArr.length; i++) {
        if (this.inputArr[i] != checkArr[i]) solved = false;
        solution = solution + "" + this.inputArr[i];
      }

      if (solved) {
        this.bubble('onPuzzleSolved', {data: solution});
      } else {
          this.inputArr = ['', '', '', ''];
      }
	}
});

