/**
 * Enyo UI
 * @see http://enyojs.com
 * @name onyx
 * @namespace
 */

/**
 * Level progess bar
 * @name onyx.UpDown
 * @class
 * @author MacFJA
 * @version 1.0 (24/03/2012)
 */
enyo.kind({
	name: "onyx.UpDown",
	kind: "enyo.Control",
	classes: "enyo-unselectable onyx-updown",

	published: {
		/** @lends onyx.UpDown# */
		
		/**
		 * Disabled the control (use getter/setter)
		 * @type Boolean
		 * @default false
		 */
		disabled: false,
		
		/**
		 * Disabled the up button (use getter/setter)
		 * @type Boolean
		 * @default false
		 */
		disabledUp: false,
		
		/**
		 * Disabled the down button (use getter/setter)
		 * @type Boolean
		 * @default false
		 */
		disabledDown: false
	},

	/**
	 * List of events to handles
	 * @private
	 */
	handlers: {
		ondown: "down",
		onup: "up",
		ontap: "tap"
	},

	/**
	 * Events send by the UpDown control
	 */
	events: {
		/** @lends onyx.UpDown# */
		/**
		 * Inform that the "+" (up) occurs
		 * @event
		 * @param {Object} inSender Event's sender
		 * @see enyojs.com for more information about events
		 */
		onUp: "",
		/**
		 * Inform that the "-" (down) occurs
		 * @event
		 * @param {Object} inSender Event's sender
		 * @see enyojs.com for more information about events
		 */
		onDown: ""
	},
	/** @lends onyx.UpDown# */
	
	/**
	 * Is the cursor is pressed? (not yet release)
	 * @private
	 * @type Boolean
	 * @default false
	 */
	isdown: false,
	
	/**
	 * Internal counter for make the increase speed
	 * @private
	 * @type Number
	 * @default 0
	 */
	downoccur: 0,
	
	/**
	 * Components of the control
	 * @ignore
	 * @type Array
	 * @default the 2 controls
	 */
	components: [
		{classes: "onyx-updown-down", name: "down", content: "-"},
		{classes: "onyx-updown-up", name: "up", content: "+"},
	],
	
	/**
	 * create function, init the object
	 * @private
	 */
	create: function() {
		this.inherited(arguments);
		this.disabledChanged();
		this.disabledUpChanged();
		this.disabledDownChanged();
	},

	/**
	 * Handler for <q>disabled</q> value change
	 * @private
	 */
	    disabledChanged: function() {
		this.addRemoveClass("disabled", this.disabled)
	},
	/**
	 * Handler for <q>disabledUp</q> value change
	 * @private
	 */
	  disabledUpChanged: function() {
		this.$.up.addRemoveClass("disabled", this.disabledUp);
	},
	/**
	 * Handler for <q>disabledDown</q> value change
	 * @private
	 */
	disabledDownChanged: function() {
		this.$.down.addRemoveClass("disabled", this.disabledDown);
	},
	
	/**
	 * Handler for <q>onTap</q> event
	 * @private
	 */
	tap: function(inSender, inEvent) {
		if(this.disabled ||//If the control is disabled
			inSender == this.$.up && this.disabledUp ||//Or the pressed button is disabled
			inSender == this.$.down && this.disabledDown)
			{ return false; }//Don't go further
			
		if(inSender == this.$.up) { this.doUp(); }//Send the OnUp event
		if(inSender == this.$.down) { this.doDown(); }//Send the OnDown event
	},
	
	/**
	 * Handler for <q>down</q> event
	 * @private
	 */
	down: function(inSender, inEvent) {
		if(this.disabled ||//If the control is disabled
			inSender == this.$.up && this.disabledUp ||
			inSender == this.$.down && this.disabledDown)//Or the pressed button is disabled
			{ return false; }//Don't go further

		this.isdown = true;//Now the button is pressed, store that information
		this.downoccur = 0;//Reset the counter
		enyo.job(this.id+"_inpress", enyo.bind(this, "askForAction", inSender == this.$.up), 500);//Make a enyo.job
	},
	
	/**
	 * Handler for <q>up</q> event
	 * @private
	 */
	up: function() {
		this.isdown = false;//The button is release, store that information
	},
	
	/**
	 * Internal method use with enyo.job
	 * @private
	 * @param {Boolean} isUp <tt><b>true</b></tt> if its the up button is pressed
	 */
	askForAction: function(isUp) {
		if(!this.isdown || this.disabled ||//If the button is release or the control is disabled
			isUp && this.disabledUp ||//Or the pressed button is disabled 
			!isUp && this.disabledDown)
			{ enyo.job.stop(this.id+"_inpress"); }//Don't go further
		else {

			if(isUp) { this.doUp(); }//Send the OnUp event
			else { this.doDown(); }//Send the OnDown event

			if(this.downoccur < 14) { this.downoccur++; }//Increase the counter is less than 14
			enyo.job(this.id+"_inpress", enyo.bind(this, "askForAction", isUp), 1000-this.downoccur*70);//Make a enyo.job
		}
	}
});