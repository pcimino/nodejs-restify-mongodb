/**
 * Enyo UI
 * @see http://enyojs.com
 * @name onyx
 * @namespace
 */

/**
 * Dynamic loaded list
 * @name onyx.DynamicList
 * @class
 * @author MacFJA
 * @version 1.2 (19/04/2012)
 * @extends enyo.Scroller
 */
enyo.kind({
	name: "macfja.DynamicList",
	kind: "enyo.Scroller",
	classes: "onyx-dynamiclist",

	published: {
		/** @lends onyx.DynamicList# */

		/**
		 * The contents of the list (use getter/setter)<br />
		 * each item is an object and <tt>template</tt> attribute (optional) the row template, <tt>owner</tt> attribute (optional), the row owner
		 * @type Array
		 */
		items: [],

		/**
		 * The default (initial) row height (in pixel) (use getter/setter)
		 * @type Number
		 * @default 40
		 */
		defaultRowHeight: 40,

		/**
		 * The template of the row, if a String, enyo.macroize will be used with data from items, if an object a Component.createComponent will be used (use getter/setter)
		 * @type String|Object
		 */
		rowsTemplate: {}
	},

	/**
	 * List of events to handles
	 * @private
	 */
	handlers: {
		onScroll: 'scrollHandler',//Touch scroll event
		onscroll: 'scrollHandler',//Desktop srcoll event
		onScrollStop: 'scrollEndHandler'
	},

	/**
	 * Events send by the UpDown control
	 */
	events: {
		/** @lends onyx.DynamicList# */
		/**
		 * Setup the row
		 * @event
		 * @param {Object} inSender Event's sender
		 * @param {Object} inEvent <tt>inEvent.template</tt> contains the row template or the generic row template, <tt>inEvent.context</tt> the data given in items attribute
		 * @see enyojs.com for more information about events
		 */
		onSetupRow: "",

		/**
		 * Inform that a row is tap
		 * @event
		 * @param {Object} inSender Event's sender
		 * @param {Object} inEvent <tt>inEvent.index</tt> is the index of the row, <tt>inEvent.context</tt> is the data given in items attribute
		 */
		onRowTap: ""
	},
	/** @lends onyx.DynamicList# */

	/**
	 * Components of the control
	 * @ignore
	 * @type Array
	 * @default <tt><i>[]</i></tt>
	 */
	components: [],

	/**
	 * The internal row list
	 * @field
	 * @private
	 * @type Array
	 */
	rows: [],

	/**
	 * The list of height of all row
	 * @private
	 * @field
	 * @type Array
	 */
	heights: [],

	/**
	 * create function, init the object
	 * @private
	 */
	create: function() {
		this.inherited(arguments);
		this.itemsChanged();
	},

	/**
	 * Handler for <q>items</q> value change
	 * @function
	 * @name onyx.DynamicList#itemsChanged
	 * @private
	 */
	itemsChanged: function() {
		this.rows = [];//Reset the internal list of row
		this.destroyClientControls();//clear the scroller contents
		for(var tour=0,size=this.items.length;tour<size;tour++) {//Create the new list of rows
			this.rows.push({
				source: this.items[tour],
				node: this.createComponent({//The default row (fix height to "defaultRowHeight")
					kind: "enyo.Control",
					classes: "onyx-dynamiclist-row",
					style: "min-height: "+this.defaultRowHeight+"px;",
					xIndex: tour,
					ontap: "rowTapHandler"
				}, {owner: this}),
				template: (this.items[tour].template || this.rowTemplate),
				generated: false
			});

			if(this.hasNode())//If the scroller is ready
				{ this.render(); }//Update it
		}
		this.resetHeights();//Create the list of rows height
		this.calculateRowToDisplay();//Get visible rows
	},

	/**
	 * Generate a list of rows
	 * @function
	 * @param {Number} from The index of first row to generate
	 * @param {Number} to The index of the last row to generate
	 * @param {Boolean} [forceRender] if <tt><b>true</b></tt> the row is regenerated
	 * @private
	 * @name onyx.DynamicList#renderRows
	 */
	renderRows: function(from, to, forceRender) {
		if(from < 0) from = 0;
		if(to >= this.rows.length) to = this.rows.length-1;
		for(var tour=from;tour<=to;tour++) {
			var theRow = this.rows[tour];
			if(forceRender || !theRow.generated) {//If the row isn't generated
				var inEvent = {context: theRow.source, template: theRow.template};//Create an inEvent object
				this.doSetupRow(inEvent);//Send the event
				if(enyo.isString(inEvent.template)) {//The template is a (HTML) string
					theRow.node.hasNode().innerHTML = enyo.macroize(inEvent.template, inEvent.context);
				}
				else {//The template is an enyo Component definition
					if(theRow.dataNode) { theRow.dataNode.destroy(); }//destroy previous node
					theRow.dataNode = theRow.node.createComponent(inEvent.template, {owner: inEvent.context.owner||this});
					theRow.node.render();
				}
				var rowHeight = theRow.node.getBounds().height;//get the new height
				this.addHeight(tour, rowHeight);//inform internal delegate
				theRow.node.addStyles("min-height: "+rowHeight+"px");//update row node height
				theRow.generated = true;//set "generated" to true
			}
		}
	},

	/**
	 * Load all rows
	 * @function
	 * @name onyx.DynamicList#loadAllRow
	 * @param {Boolean} [forceRender] if <tt><b>true</b></tt> the row is regenerated
	 */
	loadAllRow: function(forceRender) {
		this.renderRows(0, this.rows.length-1, !!forceRender);
	},

	/**
	 * Calculate the list of the row that is displayed and generate them if needed
	 * @function
	 * @private
	 * @name onyx.DynamicList#calculateRowToDisplay
	 */
	calculateRowToDisplay: function() {
		if(!this.hasNode())//If the scroller is not ready, delay the method
			{ enyo.asyncMethod(this, "calculateRowToDisplay"); return; }

		//Get sizes
		var top = this.getScrollBounds().top,
			visibleHeight = this.getBounds().height,
			visibleRow = Math.ceil(visibleHeight/this.avgHeight());

		//Get visible rows
		lastToDisplay = this.indexAtHeight(top+visibleHeight+1);//One after
		firstToDisplay = lastToDisplay-visibleRow-1;//this.indexAtHeight(top)-1;//One before
		if(firstToDisplay < 0) firstToDisplay = 0;

		this.renderRows(firstToDisplay, lastToDisplay);
	},

	/**
	 * Handler for event <q>onTap</q> of row
	 * @function
	 * @private
	 * @param {Object} inSender The event sender
	 * @param {Object} inEvent The event
	 * @name onyx.DynamicList#rowTapHandler
	 */
	rowTapHandler: function(inSender, inEvent) {
		var rowIdx = inSender.xIndex;
		this.doRowTap({index: rowIdx, context: this.rows[rowIdx].source});//Send onRowTap event
		return true;
	},


	/**
	 * Handler for event <q>onScroll</q>
	 * @function
	 * @private
	 * @param {Object} inSender The event sender
	 * @param {Object} inEvent The event
	 * @name onyx.DynamicList#scrollHandler
	 */
	scrollHandler: function(inSender, inEvent) {
		//Limit calculateRowToDisplay call (memory save...)
		enyo.job("calculateRowToDisplay", enyo.bind(this, "calculateRowToDisplay"), 15);
	},

	/**
	 * Handler for event <q>onScrollStop</q>
	 * @function
	 * @private
	 * @param {Object} inSender The event sender
	 * @param {Object} inEvent The event
	 * @name onyx.DynamicList#scrollEndHandler
	 */
	scrollEndHandler: function(inSender, inEvent) {
		this.calculateRowToDisplay();
	},

	/**
	 * Force the redraw of a row
	 * @function
	 * @param {Number} index The index of the row that need to be redraw
	 * @name onyx.DynamicList#invalidateRow
	 */
	invalidateRow: function(index) {
		if(!this.rows[index]) { return; }//If the row doesn't exist, end the fonction
		this.rows[index].generated = false;//Set generated to "false", to force the row to be redraw
		this.calculateRowToDisplay();//Redraw the visible rows (in case where the row "index" is visible)
	},

	/**
	 * Get the row index for a specific height (in pixel)
	 * @private
	 * @param {Number} height The height
	 * @returns The row index
	 * @type Number
	 * @function
	 * @name onyx.DynamicList#indexAtHeight
	 */
	indexAtHeight: function(height) {
		var tour = 0,
			calcHeight = 0,
			size = this.heights.length;
		for(;tour<size;tour++) {
			calcHeight+= this.heights[tour];//Get the sum height from 0 to "tour"

			if(calcHeight >= height) return tour;//If the sum of height is sup or equal then return "tour"
		}
		return size-1;//Return the last index
	},

	/**
	 * Calculate the average height of a row
	 * @function
	 * @private
	 * @returns The row height
	 * @type Number
	 * @name onyx.DynamicList#avgHeight
	 */
	avgHeight: function() {
		return Math.round(this.totalHeight()/this.heights.length);
	},

	/**
	 * Calculate the sum of all row height
	 * @function
	 * @private
	 * @returns The total height
	 * @type Number
	 * @name onyx.DynamicList#totalHeight
	 */
	totalHeight: function() {
		var total = 0,
			tour = 0,
			size = this.heights.length;
		for(;tour<size;tour++) {
			total+=this.heights[tour];
		}

		return total;
	},

	/**
	 * Set a row height
	 * @function
	 * @private
	 * @param {Number} idx The index of the row
	 * @param {Number} height The new height to set
	 * @name onyx.DynamicList#addHeight
	 */
	addHeight: function(idx, height) {
		this.heights[idx] = height;
	},

	/**
	 * Reset all row height to the default row height
	 * @function
	 * @private
	 * @name onyx.DynamicList#resetHeights
	 */
	resetHeights: function() {
		this.heights = [];
		var tour = 0,
			size = this.rows.length;
		for(;tour<size;tour++) {
			this.heights.push(this.defaultRowHeight)
		}
	}
});


