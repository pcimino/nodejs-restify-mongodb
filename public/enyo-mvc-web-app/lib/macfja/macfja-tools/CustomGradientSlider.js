/**
 * Enyo UI
 * @see http://enyojs.com
 * @name onyx
 * @namespace
 */

/**
 * @name onyx.CustomGradientSlider
 * @class
 * @requires onyx.Slider
 * @extends onyx.Slider
 * @author MacFJA
 * @version 1.0 (07/04/2012)
 */
enyo.kind({
	/** @lends onyx.CustomGradientSlider */
	name: "onyx.CustomGradientSlider",
	kind: "onyx.Slider",
	
	published: {
		/** @lends onyx.CustomGradientSlider# */

		/**
		 * The path to the gradient image (use getter/setter)
		 * @type String
		 * @default ""
		 */
		gradientPath: "",
	},
	
	/**
	 * Creator of the object
	 * @private
	 */
	create: function() {
		this.inherited(arguments);
		this.applyStyle("background-size", "100% 100%");
		enyo.asyncMethod(this, "gradientPathChanged");
	},
	
	/**
	 * Override PrograssBar.updateBarPosition, remove display
	 * @private
	 */
	updateBarPosition: function(inPercent) {
		this.$.bar.applyStyle("width", "0%");
	},
	
	/**
	 * Handler for <q>gradientPath</q> value change
	 * @private
	 */
	gradientPathChanged: function() {
		this.hasNode().style.backgroundImage = "url(\""+this.gradientPath+"\")";
	}
});