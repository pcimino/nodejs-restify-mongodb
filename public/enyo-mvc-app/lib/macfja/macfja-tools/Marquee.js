/**
 * Enyo UI
 * @see http://enyojs.com
 * @name onyx
 * @namespace
 */

/**
 * Marquee, sliding texte
 * @name onyx.Marquee
 * @class
 * @author MacFJA
 * @version 1.1 (22/07/2012)
 */
enyo.kind({
	name: "onyx.Marquee",
	kind: "enyo.Control",

	classes: "onyx-marquee",
	
	published: {
		/** @lends onyx.Marquee# */

		/**
		 * The duration of the sliding of the text (in milliseconds)
		 * @type Number
		 * @default 5000
		 */
		animationDuration: 5000,

		/**
		 * The duration of the pause between two sliding (in milliseconds)
		 * @type Number
		 * @default 4000
		 */
		animationPause: 4000,

		/**
		 * If activate, the animation will start automatically when the text is too long to be displayed,
		 * otherwise, you have to use <tt>start()</tt> to start sliding (if needed)
		 * @type Boolean
		 * @default true
		 */
		autoStart: true,

		/**
		 * The marquee strategy,
		 * Horizontal or Vertical scrolling can be set with,
		 * respectively, MarqueeHorizontalStrategy and MarqueeVerticalStrategy
		 * @type String
		 * @default MarqueeHorizontalStrategy
		 */
		strategyKind: "MarqueeHorizontalStrategy"
	},

	/**
	 * Components of the control
	 * @ignore
	 * @type Array
	 */
	components: [
		{kind: "enyo.Animator", name: "slide", easingFunction: enyo.easing.quadInOut},
		{kind: "enyo.Control", name: "textSlider", classes: "onyx-marquee-slider", components: [
			{kind: "enyo.Control", name: "first", content: "a", classes: "onyx-marquee-first"},
			{kind: "enyo.Control", name: "second", content: "b", classes: "onyx-marquee-second", showing: false}
		]}
	],
	
	/**
	 * Events handled by the control
	 * @ignore
	 * @type Object
	 */
	handlers: {
		/**
		 * Resizing event, send by Enyo
		 */
		onresize: "resize"
	},

	/** @lends onyx.Marquee# */

	/**
	 * Handler for <q>animationDuration</q> value change
	 * @function
	 * @private
	 */
	animationDurationChanged: function(oldValue) {
		this.$.slide.setDuration(this.animationDuration);
	},

	/**
	 * Handler for <q>strategyKind</q> value change
	 * Duplicating from ScrollStrategy
	 * @private
	 */
	strategyKindChanged: function() {
		if (this.$.strategy) {
			this.$.strategy.destroy();
		}

		this.createStrategy();
		if (this.hasNode()) {
			this.render();
		}
	},
	/**
	 * Create a new marquee strategy
	 * Duplicating from ScrollStrategy
	 * @private
	 */
	createStrategy: function() {
		var ref = this.createComponent({name: "strategy", kind: "onyx."+this.strategyKind,
			visibleControl: this,
			textControl: this.$.first,
			sliderControl: this.$.textSlider,
			onEnd: "slideEnd"
		});

		this.$.slide.onStep = enyo.bind(this.$.strategy, "animationStep");
		this.$.slide.onEnd = enyo.bind(this.$.strategy, "animationEnd");
	},

	/**
	 * Getter of the marquee strategy
	 * @type Object
	 * @function
	 * @return the strategy kind
	 * @name onyx.Marquee#getStrategy
	 */
	getStrategy: function() {
		return this.$.strategy;
	},

	/**
	 * Stop any animation, and prevent next animation
	 * @function
	 * @name onyx.Marquee#stop
	 */
	stop: function() {
		//Stop animator
		this.$.slide.stop();
		//Stop strategy
		if(this.$.strategy) this.$.strategy.stop();
		//Stop enyo job 
		enyo.job.stop(this.makeId+"-pause");
	},

	/**
	 * Start scrolling animation (if needed)
	 * The animation start with a pause
	 * @function
	 * @name onyx.Marquee#start
	 */
	start: function() {
		if(this.$.strategy && this.$.strategy.needToSlide()) {
			//Prepare strategy kind (initilise internal variable)
			this.$.strategy.prepare();
			//Show the duplicated text
			this.$.second.show();
			//Start job (delay)
			enyo.job(this.makeId()+"-pause", enyo.bind(this, "startAnim"), this.animationPause);
		}
	},

	/**
	 * create function, init the object
	 * @private
	 */
	create: function() {
		this.inherited(arguments);
		this.strategyKindChanged();
		this.animationDurationChanged();
		enyo.asyncMethod(this, "contentChanged");
	},

	/**
	 * Handler for <q>onResize</q> event send by Enyo
	 * @private
	 */
	resize: function() {
		this.inherited(arguments);
		this.contentChanged();
	},

	/**
	 * Handler for <q>animationDuration</q> value change
	 * @private
	 */
	contentChanged: function() {
		this.stop();
		this.$.second.hide();
		this.$.first.setContent(this.content);
		this.$.second.setContent(this.content);
		
		if(this.autoStart) this.start();
	},

	/**
	 * Handler for <q>kind_id-pause</q> job
	 * @private
	 */ 
	startAnim: function() {
		this.$.slide.play();
	},

	/**
	 * Handler for <q>onEnd</q> of Strategy
	 * @private
	 */
	slideEnd: function(inSender) {
		this.start();
	}

});