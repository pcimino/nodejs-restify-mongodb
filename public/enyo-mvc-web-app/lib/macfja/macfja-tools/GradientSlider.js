/**
 * Enyo UI
 * @see http://enyojs.com
 * @name onyx
 * @namespace
 */

/**
 * @name onyx.GradientSlider
 * @class
 * @requires onyx.Slider
 * @extends onyx.Slider
 * @author MacFJA
 * @version 1.0 (07/04/2012)
 */
enyo.kind({
	/** @lends onyx.GradientSlider */
	name: "onyx.GradientSlider",
	kind: "onyx.Slider",
	classes: "onyx-gradientslider",

	/**
	 * Override PrograssBar.updateBarPosition
	 * @private
	 */
	updateBarPosition: function(inPercent) {
		this.inherited(arguments);
		this.$.bar.applyStyle("background-size", 10000/inPercent+"% 100%");
	}
});