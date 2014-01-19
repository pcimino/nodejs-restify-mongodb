/**
 * Enyo Core
 * @see http://enyojs.com
 * @name enyo
 * @namespace
 */
/** @class
 * @name enyo.Input
 */
/**
 * @name enyo.GrowTextBox
 * @class
 * @extends enyo.Input
 * @requires enyo.Input
 * @author MacFJA
 * @version 1.0 (02/08/2012)
 */
enyo.kind({
	name: "enyo.GrowTextBox",
	kind: "enyo.Input",
	tag: "textarea",

	published: {
		/** @lends enyo.GrowTextBox# */
		
		/**
		 * The minimum number of rows to display.<br />
		 * if the value is not a finite number and not > to 0 then the value is set to 1.
		 * @type Number
		 * @default 2
		 */
		minRows: 2,
		/**
		 * The minimum number of columns to display.<br />
		 * if the value is not a finite number and not > to 0 then the value is set to 1.
		 * @type Number
		 * @default 1
		 */
		minCols: 1,
		/**
		 * The maximum number of rows to display.<br />
		 * if the value is not a number or <code>NaN</code> or <code>0</code> there are no vertical growing.<br />
		 * if the value is <code>Infinity</code> there are no limit
		 * @type Number
		 * @default 4
		 */
		maxRows: 4,
		/**
		 * The maximum number of columns to display.<br />
		 * if the value is not a number or <code>NaN</code> or <code>0</code> there are no horizontal growing.<br />
		 * if the value is inferior to the min value, then the value is set to <code>NaN</code>
		 * if the value is <code>Infinity</code> there are no limit
		 * @type Number
		 * @default NaN
		 */
		maxCols: NaN,
		
	},

	events: {
		/** @lends enyo.GrowTextBox# */
		/**
		 * Event to inform that the textarea size have changed
		 * @param inSender The event's sender
		 * @param inEvent The event. <code>inEvent.type</code> is the name of the property (<q>rows</q> or <q>cols</q>) and <code>inEvent.old</code> is the previous size, and <code>inEvent.new</code> is the new one
		 * @event
		 */
		onSizeChange: ""
	},

	/** @lends enyo.GrowTextBox# */

	/**
	 * Handler for <q>oninput</q> event
	 * @private
	 * @ignore
	 */
	handlers: {
		oninput: "updateSize"
	},

	/**
	 * Memory for the actual size
	 * @private
	 */
	actual: {
		rows: 1,
		cols: 1
	},

	/**
	 * Make a resize
	 * @param attributeName The name of the attribute (<q>rows</q> or <q>cols</q>)
	 * @private
	 * @name enyo.GrowTextBox#makeResize
	 * @function
	 */
	makeResize: function(attributeName) {
		var attr = this["getMin"+enyo.cap(attributeName)]();
		//Set to minimum size for initialise resizing
		this.setAttribute(attributeName, attr);

		//Loop if the limit is not reach and if we need to increase the attribute to remove scroller
		while(this.canResize(attributeName, attr) && this.needIncrease(attributeName)) {
			//Increase the attribute
			attr++;
			this.setAttribute(attributeName, attr);
		}

		//Check is the attribute have changed
		if(attr != this.actual[attributeName]) {
			//Build the event
			var inEvent = {
				type: attributeName,
				old: this.actual[attributeName],
				new: attr
			};
			//Send the event
			this.doSizeChange(inEvent);
			//Update the memory
			this.actual[attributeName] = attr;
		}
	},
	/**
	 * Check if the attribute <code>attributeName</code> doesn't reach its maximun
	 * @param attributeName The name of the attribute (<q>rows</q> or <q>cols</q>)
	 * @param value The value of the attribute
	 * @private
	 * @name enyo.GrowTextBox#canResize
	 * @function
	 */
	canResize: function(attributeName, value) {
		max = this["getMax"+enyo.cap(attributeName)]();
		return value < max;
	},
	/**
	 * Check if the textarea need to be resized.
	 * @param attributeName The name of the attribute (<q>rows</q> or <q>cols</q>)
	 * @private
	 * @function
	 * @name enyo.GrowTextBox#needIncrease
	 */
	needIncrease: function(attributeName) {
		//var bounds = this.getBounds();
		// Use hasNode().clientXxx because getBounds use offetXxx.
		// And offsetXxx considere margin and that can introduce some calculation error :
		// if the margin is 10 then bounds.width is 10px > than scrollWidth when graphically
		// you have exactly the neccessary width to avoir scrolling

		if(attributeName == "rows") {
			return this.hasNode().clientHeight < this.hasNode().scrollHeight;
		}
		else if(attributeName == "cols") {
			return this.hasNode().clientWidth < this.hasNode().scrollWidth;
		}
	},
	/**
	 * Indicate if the <code>inValue</code> can be considere as a maxmium value
	 * @param inValue The value to test
	 * @return {Boolean} <code>false</code> if <code>inValue</code> is not a number or if <code>inValue</code> equals to <code>NaN</code> or <code>0</code>, <code>true</code> otherwise
	 * @private
	 * @name enyo.GrowTextBox#growFor
	 * @function
	 */
	growFor: function(inValue) {
		if (inValue == Infinity) {
			return true;
		}
		var intValue = parseInt(inValue);
		if (
			isNaN(intValue) ||
			intValue == 0
		) {
			return false;
		}
		
		return true;
	},
	/**
	 * Function that launch resize calculation
	 * @name enyo.GrowTextBox#updateSize
	 * @function
	 */
	updateSize: function() {
		if (this.growFor(this.maxCols)) {
			this.applyStyle("white-space", "nowrap");
			this.setAttribute("wrap", "off");//Not W3C, but Hack for FF, IE and "compatible" with WebKit!
			this.makeResize("cols");
			this.applyStyle("white-space", null);
			this.setAttribute("wrap", null);
		}
		if (this.growFor(this.maxRows)) {
			this.makeResize("rows");
		}
	},
	/**
	 * Handler for <q>value</q> change
	 * @private
	 * @name enyo.GrowTextBox#valueChanged
	 * @function
	 */
	valueChanged: function() {
		this.inherited(arguments);
		this.updateSize();
	},
	/**
	 * Handler for <q>minRows</q> value change
	 * @private
	 * @name enyo.GrowTextBox#minRowsChanged
	 * @function
	 */
	minRowsChanged: function() { limitChanged("rows"); },
	/**
	 * Handler for <q>maxRows</q> value change
	 * @private
	 * @name enyo.GrowTextBox#maxRowsChanged
	 * @function
	 */
	maxRowsChanged: function() { limitChanged("rows"); },
	/**
	 * Handler for <q>minCols</q> value change
	 * @private
	 * @name enyo.GrowTextBox#minColsChanged
	 * @function
	 */
	minColsChanged: function() { limitChanged("cols"); },
	/**
	 * Handler for <q>maxCols</q> value change
	 * @private
	 * @name enyo.GrowTextBox#maxColsChanged
	 * @function
	 */
	maxColsChanged: function() { limitChanged("cols"); },
	/**
	 * Handler for published property changed
	 * @param attributeName The name of the attribute (<q>rows</q> or <q>cols</q>)
	 * @private
	 * @name enyo.GrowTextBox#limitChanged
	 * @function
	 */
	limitChanged: function(attributeName) {
		var maxName = "max"+enyo.cap(attributeName),
			minName = "min"+enyo.cap(attributeName),
			minValue = parseInt(this[minName]),
			maxValue = parseInt(this[minName]);
		
		if (!isFinite(minValue) || minValue < 1) {
			this[minName] = 1;
		}
		
		if (isFinite(maxValue) && maxValue < minValue) {
			this[maxName] = NaN;
		}
	}
})