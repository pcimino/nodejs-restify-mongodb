/**
 * Enyo UI
 * @see http://enyojs.com
 * @name onyx
 * @namespace
 */

/**
 * Rating level selector
 * @name onyx.RatingLevel
 * @class
 * @author MacFJA
 * @version 1.0 (24/03/2012)
 * @extends onyx.LevelProgress
 */
enyo.kind({
	name: "onyx.RatingLevel",
	kind: "onyx.LevelProgress",
	classes: "enyo-unselectable onyx-rating-bar",

	
	/**
	 * create function, init the object
	 * @private
	 */
	create: function() {
		this.margin = 7;
		this.inherited(arguments);
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
				classes: "onyx-rating-element",
				value: tour,
				type: "visual"
			});
		}
		this.render();
	}
});