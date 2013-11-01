/**
 * Enyo UI
 * @see http://enyojs.com
 * @name onyx
 * @namespace
 */

/**
 * Level progess bar
 * @name onyx.LevelProgress
 * @class
 * @author MacFJA
 * @version 1.0 (24/03/2012)
 */
enyo.kind({
	name: "onyx.LevelProgress",
	kind: "enyo.Control",
	classes: "enyo-unselectable onyx-level-bar",

	published: {
		/** @lends onyx.LevelProgress# */

		/**
		 * The warning level (yellow) (use getter/setter)
		 * @type Number
		 * @default 5
		 */
		warning: 5,

		/**
		 * The critical level (red) (use getter/setter)
		 * @type Number
		 * @default 3
		 */
		critical: 3,
		
		/**
		 * The maximum value of the progression (use getter/setter)
		 * @type Number
		 * @default 10
		 */
		maximum: 10,
		
		/**
		 * The minimum value of the progression (use getter/setter)
		 * @type Number
		 * @default 0
		 */
		minimum: 0,
		
		/**
		 * The value of the progression (use getter/setter)
		 * @type Number
		 * @default 5
		 */
		value: 5,
		
		/**
		 * Define is user can change value (use getter/setter)
		 * @type Boolean
		 * @default true
		 */
		editable: true,
		
		/**
		 * Display the value of each level (use getter/setter)
		 * @type Boolean
		 * @default true
		 */
		showValue: true,
	},

	/** @private */
	handlers: {
		onresize: "rezise",
		ontap: "tap",
		ondragstart: "dragstart",
		ondragfinish: "dragfinish",
		onenter: "enter"
	},

	events: {
		/** @lends onyx.LevelProgress# */
		/**
		 * Inform that the value has changed
		 * @event
		 * @param {Object} inSender Event's sender
		 * @param {Object} inData <tt>inData.value</tt>, contain the new value
		 * @see enyojs.com for more information about events
		 */
		onChange: "",
		/**
		 * Inform that the value is changing
		 * @event
		 * @param {Object} inSender Event's sender
		 * @param {Object} inData <tt>inData.value</tt>, contain the new value
		 * @see enyojs.com for more information about events
		 */
		onChanging: ""
	},
	
	margin: 4,//Left + Right
	dragging: false,//is the drag occurs?
	
	/** @lends onyx.LevelProgress# */
	
	/**
	 * create function, init the object
	 * @private
	 */
	create: function() {
		this.inherited(arguments);
		this.editableChanged();
		enyo.asyncMethod(this, "build");
		enyo.asyncMethod(this, "redraw", true);
	},

	/**
	 * Handler for <q>warning</q> value change
	 * @private
	 */
	  warningChanged: function() {
		this.redraw();
	},
	/**
	 * Handler for <q>critical</q> value change
	 * @private
	 */
	 criticalChanged: function() {
		this.redraw();
	},
	/**
	 * Handler for <q>maximum</q> value change
	 * @private
	 */
	  maximumChanged: function() {
		if(this.maximum <= this.minimum) {
			this.maximum = this.minimum+1;
		}
		this.build();
		this.redraw(true);
	},
	/**
	 * Handler for <q>minimum</q> value change
	 * @private
	 */
	  minimumChanged: function() {
		if(this.minimum >= this.maximum) {
			this.minimum = this.maximum-1;
		}
		this.build();
		this.redraw(true);
	},
	/**
	 * Handler for <q>value</q> value change
	 * @private
	 */
	    valueChanged: function() {
		if(this.value < this.minimum) { this.value = this.minimum; }
		if(this.value > this.maximum) { this.value = this.maximum; }
		this.redraw();
	},
	/**
	 * Handler for <q>showValue</q> value change
	 * @private
	 */
	showValueChanged: function() {
		this.redraw();
	},
	/**
	 * Handler for <q>editable</q> value change
	 * @private
	 */
	 editableChanged: function() {
		this.addRemoveClass("onyx-level-editable", this.editable);
	},
	

	/**
	 * Function that destroy all level and recreate them
	 * @private
	 */
	build: function() {
		this.destroyComponents();
		this.createComponent({
			kind: "enyo.Control",
			onenter: "enter",
			classes: "onyx-level-element-hidden",
			value: this.minimum,
			type: "visual"
		});
		for(var tour=this.minimum+1;tour<=this.maximum;tour++) {
			this.createComponent({
				kind: "enyo.Control",
				onenter: "enter",
				classes: "onyx-level-element",
				value: tour,
				type: "visual"
			});
		}
		this.render();
	},

	/**
	 * Function that redaw (update visual) all level
	 * @function
	 * @param {Boolean} updateWidth inform that the with of levels need to be recalculate
	 * @param {Boolean} force inform that the all levels need to be recreate
	 */
	redraw: function(updateWidth) {
		var elements = this.getComponents(),
			bounds = this.getBounds(),
			elmWidth = Math.floor(bounds.width/(this.maximum-this.minimum)-this.margin),
			loopMax = elements.length,
			tour = 0;

		for(;tour<loopMax;tour++) {
			if(updateWidth) { elements[tour].setBounds({width: elmWidth}, 'px'); }

			var elmValue = elements[tour].value,
				isOn = elmValue <= this.value;

			elements[tour].setContent(this.showValue?elmValue:"");
			elements[tour].addRemoveClass("normal",   isOn && this.value >  this.warning);
			elements[tour].addRemoveClass("warning",  isOn && this.value >  this.critical);
			elements[tour].addRemoveClass("critical", isOn && this.value <= this.critical);
			elements[tour].addRemoveClass("off", !isOn);
		}
	},
	
	/**
	 * Handler for <q>onResize</q> event
	 * @private
	 */
	rezise: function() {
		this.redraw(true);
		return true;
	},
	/**
	 * Handler for <q>onTap</q> event
	 * @private
	 */
	tap: function(inSender, inEvent) {
		if(!this.editable) { return false; }
		if(inSender.type && inSender.type == "visual") {
			this.setValue(inSender.value);
			this.doChange({value: this.value});
		}
	},
	/**
	 * Handler for <q>onDragStart</q> event
	 * @private
	 */
	dragstart: function(inSender, inEvent) {
		if (this.editable && inEvent.horizontal) {
			this.dragging = true;
			if(inSender.type && inSender.type == "visual") {
				this.setValue(inSender.value);
				this.doChanging({value: this.value});
			}
			inEvent.preventNativeDefault();
			return true;
		}
	},
	/**
	 * Handler for <q>onDragFinish</q> event
	 * @private
	 */
	dragfinish: function(inSender, inEvent) {
		if(this.editable && this.dragging) {
			this.dragging = false;
			inEvent.preventTap();
			this.doChange({value: this.value});
			return true;
		}
	},
	/**
	 * Handler for <q>onEnter</q> event
	 * @private
	 */
	enter: function(inSender, inEvent) {
		if(!this.editable || !this.dragging) { return false; }

		if(inSender.type && inSender.type == "visual") {
			this.setValue(inSender.value);
			this.doChanging({value: this.value});
			return true;
		}
	}
});