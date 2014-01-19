/**
 * Enyo UI
 * @see http://enyojs.com
 * @name onyx
 * @namespace
 */

/**
 * A navigation bar (path bar)
 * @name onyx.NavigationBar
 * @class
 * @author MacFJA
 * @version 1.1 (07/04/2012)
 * @requires enyo.Scroller
 */
enyo.kind({
	/** @lends onyx.NavigationBar# */
	name: "onyx.NavigationBar",
	kind: "enyo.Control",
	classes: "enyo-unselectable onyx-navigationbar",

	published: {
		/** @lends onyx.NavigationBar# */
		/**
		 * The path (use getter/setter, documented below)
		 * @type Array|String
		 * @default ""
		 */
		path: "",
	},

	handlers: {},

	events: {
		/** @lends onyx.NavigationBar# */
		/**
		 * Inform that the selected part of the path changed
		 * @event
		 * @param {Object} inSender Event's sender
		 * @param {Object} inEvent <tt>inEvent.old</tt> is the previously selected id, and <tt>inEvent.new</tt> is the new one
		 * @see enyojs.com for more information about events
		 */
		onSelected: "",
		/**
		 * Inform that a part of the path has been removed
		 * @event
		 * @param {Object} inSender Event's sender
		 * @param {Object} inEvent <tt>inEvent.path</tt> the name (label) of the remove part, <tt>inEvent.id</tt> the id of the remove part
		 * @see enyojs.com for more information about events
		 */
		onPathRemove: ""
	},
	/** @lends onyx.NavigationBar# */

	/**
	 * The id of the actual selected path
	 * @private
	 * @type Number
	 * @default -1
	 */
	selected: -1,

	/**
	 * List of part of the path {label, node, uid}
	 * @private
	 * @type Array
	 * @default []
	 */
	items: [],

	/**
	 * The last uid (only increase)
	 * @private
	 * @type Number
	 * @default 0
	 */
	uid: 0,

	/**
	 * Components of the control
	 * @ignore
	 * @type Array
	 * @default the scroller
	 */
	components: [
		{kind: "enyo.Scroller", strategyKind: "TouchScrollStrategy", classes: "onyx-navigationbar-scroller", vertical: "hidden", name: "scroller"}
	],
	/** @lends onyx.NavigationBar# */
	/**
	 * create function, init the object
	 * @private
	 */
	create: function() {
		this.inherited(arguments);

		this.setPath(this.path);
	},

	/**
	 * Add a "level" to the path (<=> add a folder), remove all level after the selected part before adding
	 * @deprecated Since 1.1, use <tt>addLevel</tt>
	 * @name onyx.NavigationBar#addToPath
	 * @function
	 * @param {String} path The name of the "level"
	 * @returns the id of the new level
	 * @type Number
	 */
	addToPath: function(path) {
		return this.addLevel(path);
	},

	/**
	 * Add a "level" to the path (<=> add a folder), remove all level after the selected part before adding
	 * @name onyx.NavigationBar#addLevel
	 * @function
	 * @param {String} name The name of the "level"
	 * @returns the id of the new level or -1 if the level has an empty name
	 * @type Number
	 */
	addLevel: function(name) {
		if(name == "") { return -1; }
		return this.addLevels([name])[0];
	},

	/**
	 * Set a complete Path
	 * @name onyx.NavigationBar#setPath
	 * @function
	 * @param {Array|String} levels The path to set
	 * @param {String} [separator] the path separator, by default <tt><b>/</b></tt>, ignore is <q>levels</q> is an array
	 * @returns The list of id of all level
	 * @type Array
	*/
	setPath: function(levels, separator) {
		this.clearPath();

		return this.addLevels(levels, separator);
	},

	/**
	 * Add a list of level <=> path
	 * @name onyx.NavigationBar#addLevels
	 * @function
	 * @param {Array|String} levels The path to add
	 * @param {String} [separator] the path separator, by default <tt><b>/</b></tt>, ignore is <q>levels</q> is an array
	 * @returns The list of id of all level
	 * @type Array
	 */
	addLevels: function(levels, separator) {
		if(!Array.isArray(levels)) {
			//Transform String path to a list of levels
			if(!separator) { separator = "/"; }
			levels = levels.split(separator);
		}

		var next = this._getItemAfter(this.selected);//Get the element after the selected "level"
		if(next)
			{ this.removeItemById(next.uid); }//Remove the next element (that will remove its next element, etc.)

		var idxs = [],//"Storage" for added id
			tour = 0,
			size = levels.length;

		for(;tour<size;tour++)
		{
			var name = levels[tour];
			if(name == "") { continue; }
			this.uid++;//Increase the uid
			//Create a new component
			var node = this.$.scroller.createComponent({
				kind: "enyo.Control",
				classes: "onyx-navigationbar-item",
				content: name,
				index: this.uid,
				ontap: "tap",
				ondblclick: "dbltap",
				//components: [{content: name}, {classes: "after"}, {classes: "before"}]
			}, {owner: this});

			if(this.$.scroller.hasNode())
				{ this.$.scroller.render(); }

			this.items.push({label: name, node: node, uid: this.uid});//Add the new "level" in the internal list
			idxs.push(this.uid);
		}
		this.selectItemById(this.uid);//Select the last "level"
		return idxs;//Return all id of new "levels"
	},

	/**
	 * Get the full path, if <q>separator</q> is defined, return a string path, an array otherwise
	 * @name onyx.NavigationBar#getPath
	 * @function
	 * @param {String} [separator] The path separator, if ignored, return an array
	 * @returns the full path (only "level" name)
	 * @type Array|String
	 */
	getPath: function(separator) {
		var tour = 0,
			pathArray = [],
			size = this.items.length;
		for(;tour<size;tour++) {
			pathArray.push(this.items[tour].label);
		}

		if(separator) { return pathArray.join(separator); }
		return pathArray;
	},

	/**
	 * Remove all "levels"
	 * @name onyx.NavigationBar#clearPath
	 * @function
	 */
	clearPath: function() {
		if(!!this.items.length) {
			this.selectItemById(-1, true);
			this.removeItemById(this.items[0].uid);
		}
	},

	/**
	 * Remove all "levels" after the selection
	 * @name onyx.NavigationBar#removeAfterSelected
	 * @function
	 */
	removeAfterSelected: function() {
		var next = this._getItemAfter(this.selected);
		if(!!this.items.length && next) {
			this.removeItemById(next.uid);
		}
	},

	/**
	 * Handler for <q>onTap</q> event
	 * @private
	 */
	tap: function(inSender, inEvent) {
		if(inSender.hasClass("onyx-navigationbar-item") && this.selected != inSender.index) {
			this.selectItemById(inSender.index);//Select the "level"
			return true;//End event propagation
		}
	},
	/**
	 * Handler for <q>onDblClick</q> event
	 * @private
	 */
	dbltap: function(inSender, inEvent) {
		if(inSender.hasClass("onyx-navigationbar-item")) {
			this.selectItemById(inSender.index);//Select the "level"

			this.removeAfterSelected();
/*			var next = this._getItemAfter(inSender.index);
			if(next)
				{ this.removeItemById(next.uid); }//Remove all "level" after*/

			return true;//End event propagation
		}
	},

	/**
	 * Gets an item (label, node, uid) with its id
	 * @private
	 * @param {Number} id The object's id
	 * @returns The object, or <tt><b>null</b></tt> if not found
	 * @type Object
	 */
	_getItem: function(id) {
		for(var tour=0,size=this.items.length;tour<size;tour++) {
			if(this.items[tour].uid == id) { return this.items[tour]; }
		}

		return null;
	},

	/**
	 * Selects a level with its id
	 * @name onyx.NavigationBar#selectItemById
	 * @function
	 * @param {Number} id The id to select
	 * @param {Boolean} noneIsNull If <tt><b>true</b></tt>, no selected item if the "level" with the id <q>id</q> is not found, if <tt><b>false</b></tt> the selected "level" is unchanged
	 */
	selectItemById: function(id, noneIsNull) {
		var item = this._getItem(id),
			prevUid = this.selected;//Store the old id

		if(this.selected > -1 && (item || noneIsNull)) {
			this._getItem(this.selected).node.removeClass("selected");//Remove the selection on the previously selected item
		}

		if(!!item) {//If item exist
			item.node.addClass("selected");//Then select it
			this.selected = item.uid;//And update the selected id

			this.doSelected({"old": prevUid, "new": item.uid});//Send event
		} else if(noneIsNull) {
			this.selected = -1;//Update the selected id

			this.doSelected({"old": prevUid, "new": -1});//Send event
		}
		this.$.scroller.scrollIntoView(item.node, true);
	},

	/**
	 * Remove a "level", and all "level" after, by a given id
	 * @name onyx.NavigationBar#removeItemById
	 * @function
	 * @param {Number} id The id of the "level" to remove
	 */
	removeItemById: function(id) {
		var item = this._getItem(id);
		if(!!item) {
			if(this.selected == id) {
				//The item to remove is the selected one
				var before = this._getItemBefore(id);
				this.selectItemById(!before?-1:before.uid, true);//If an item before select it, or select nothing
			}

			var next = this._getItemAfter(item.uid),
				path = item.label,
				oldId = item.uid;
			if(next) { this.removeItemById(next.uid); }//Remove the next item (if exist)

			this.items.pop();//Remove the last element of the array

			item.node.destroy();//Destroy the node
			this.doPathRemove({"path": path, "id": oldId});//Send event
		}
	},

	/**
	 * Gets the item (label, node, uid) after a given id
	 * @private
	 * @param {Number} id The reference id
	 * @returns The item after, or <tt><b>null</b></tt> if reference item doesn't exist or if no item after the reference
	 * @type Object
	 */
	_getItemAfter: function(id) {
		for(var tour=0,size=this.items.length;tour<size;tour++) {
			if(this.items[tour].uid == id) {
				if(tour == size-1) { return null; }//The last item
				return this.items[tour+1];
			}
		}

		return null;
	},

	/**
	 * Gets the item (label, node, uid) before a given id
	 * @private
	 * @param {Number} id The reference id
	 * @returns The item before, or <tt><b>null</b></tt> if reference item doesn't exist or if the reference is the first item
	 * @type Object
	 */
	_getItemBefore: function(id) {
		for(var tour=0,size=this.items.length;tour<size;tour++) {
			if(this.items[tour].uid == id) {
				if(tour == 0) { return null; }//The first item
				return this.items[tour-1];
			}
		}

		return null;
	},

	/**
	 * Gets the item (path, id) by its <q>id</q>
	 * @name onyx.NavigationBar#getItemById
	 * @function
	 * @param {Number} id The reference id
	 * @returns An object ({"path": "...", "id": "..."}), or <tt><b>null</b></tt> if id doesn't exist
	 * @type Object
	 */
	getItemById: function(id) {
		var item = this._getItem(id);
		if(item) {
			return {"path": item.label, "id": id};
		}
		else {
			return null;
		}
	},
	/**
	 * Gets the list of items (path, id) by their <q>path</q>
	 * @name onyx.NavigationBar#getItemsByPath
	 * @function
	 * @param {String} path the path to find
	 * @returns An array of object ({"path": "...", "id": "..."})
	 * @type Array
	 */
	getItemsByPath: function(path) {
		var items = [],
			tour = 0,
			size = this.items.length;
		for(;tour<size;tour++) {
			if(this.items[tour].label == path) { items.push({"path": path, id: this.items[tour].uid}) }
		}

		return items;
	},

	/**
	 * Gets the item (path, id) after the selected item
	 * @name onyx.NavigationBar#getNextItem
	 * @function
	 * @returns The next object ({"path": "...", "id": "..."}), or <tt><b>null</b></tt> if the selected item is the last one
	 * @type Object
	 */
	getNextItem: function() {
		var next = this._getItemAfter(this.selected);
		return this.getItemById(next?next.uid:null);
	},

	/**
	 * Gets the item (path, id) before the selected item
	 * @name onyx.NavigationBar#getPreviousItem
	 * @function
	 * @returns The previous object ({"path": "...", "id": "..."}), or <tt><b>null</b></tt> if the selected item is the first one
	 * @type Object
	 */
	getPreviousItem: function() {
		var before = this._getItemBefore(this.selected);
		return this.getItemById(before?before.uid:null);
	},

	/**
	 * Selects the item (path, id) after the actual selected item
	 * @name onyx.NavigationBar#selectNextItem
	 * @function
	 */
	selectNextItem: function() {
		var next = this._getItemAfter(this.selected)
		this.selectItemById(next?next.uid:null)
	},

	/**
	 * Selects the item (path, id) before the actual selected item
	 * @name onyx.NavigationBar#selectPreviousItem
	 * @function
	 */
	selectPreviousItem: function() {
		var before = this._getItemBefore(this.selected)
		this.selectItemById(before?before.uid:null)
	}
});