/**
 * Enyo UI
 * @see http://enyojs.com
 * @name onyx
 * @namespace
 */

/**
 * Marquee, sliding texte, horizontal strategy
 * @name onyx.MarqueeHorizontalStrategy
 * @class
 * @author MacFJA
 * @version 1.0 (12/07/2012)
 */

enyo.kind({
	name: "onyx.MarqueeHorizontalStrategy",

	published: {
		/** @lends onyx.MarqueeHorizontalStrategy# */
		
		/**
		 * Container object.
		 * It contains all object and represent visible area
		 * @type Oject
		 * @default null
		 */
		visibleControl: null,
		
		/**
		 * Sliding object, it's the object that slide
		 * @type Object
		 * @default null
		 */
		sliderControl: null,
		
		/**
		 * The main text object.
		 * @type Object
		 * @default null
		 */
		textControl: null
	},

	events: {
		/** @lends onyx.MarqueeHorizontalStrategy# */
		/**
		 * Inform that the animation is terminated
		 * @event
		 * @param {Object} inSender Event's sender
		 * @see enyojs.com for more information about events
		 */
		onEnd: "",
	},

	endValue: 0,
	marge: 30,

	/** @lends onyx.MarqueeHorizontalStrategy# */

	/**
	 * Initilize class
	 * @private
	 * @function
	 */
	create: function() {
		this.inherited(arguments);
		
		this.sliderControl.setClasses("onyx-marquee-horizontal-strategy");
	},

	/**
	 * Handler for <q>onStep</q> of the animator
	 * @private
	 */
	animationStep: function(inSender) {
		this.sliderControl.setBounds({left: "-"+inSender.value*this.endValue+"px"});
	},
	
	/**
	 * Handler for <q>onEnd</q> of the animator
	 * @private
	 */
	animationEnd: function(inSender) {
		this.stop();

		this.doEnd();
	},
	
	/**
	 * Inform if the text is clipped and, so, if the text need to slide
	 * @return <tt>true</tt> if the text need to slide
	 * @function
	 * @type Boolean
	 * @name onyx.MarqueeHorizontalStrategy#needToSlide
	 */
	needToSlide: function() {
		if(!this.isReady()) return false;

		var refBound = this.visibleControl.getBounds(),
			textBound = this.textControl.getBounds();

		return (refBound.width < textBound.width);
	},
	
	/**
	 * Prepare the strategy and marquee element to the animation
	 * @function
	 * @name onyx.MarqueeHorizontalStrategy#prepare
	 */
	prepare: function() {
		if(!this.isReady()) return false;

		var textBound = this.textControl.getBounds();
		this.endValue = textBound.width + this.marge;
	},
	/**
	 * Inform if the strategy is ready to work
	 * @private
	 * @type Boolean
	 * @return <tt>true</tt> if the strategy is ready
	 */
	isReady: function() {
		return (this.visibleControl && this.textControl && this.sliderControl);
	},
	
	/**
	 * Stop the aniamtion, set sliding to 0
	 * @function
	 * @name onyx.MarqueeHorizontalStrategy#stop
	 */
	stop: function() {
		this.sliderControl.setBounds({left: "0px"});
	}
});