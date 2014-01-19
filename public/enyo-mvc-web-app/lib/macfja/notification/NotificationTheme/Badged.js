/**
 * Notification theme
 * @see http://enyojs.com
 * @name notification
 * @namespace
 */

/**
 * Notification with a counter
 * @name notification.Badged
 * @class
 * @author MacFJA
 * @version 1.2 (27/09/2013)
 */
enyo.kind({
	name: "notification.Badged",
	kind: "enyo.Control",

	published: {
		/** @lends notification.Badged# */
		/**
		 * The default duration time (in millisec) for notification, use if no duration is specified (use getter/setter)
		 * @field
		 * @type Number
		 * @default 2000
		 * @name notification.Badged#defaultDuration
		 */
		defaultDuration: 2000
	},

	events: {
		/** @lends notification.Badged# */
		/**
		 * Inform that the notification is tap
		 * @event
		 * @param {Object} inSender Event's sender
		 * @param {Object} inEvent <tt>inEvent.notification</tt> contains the notification object passed in the <q>newNotification</q> method and <tt>inEvent.uid</tt> the uid
		 * @see enyojs.com for more information about events
		 */
		onTap: "",

		/**
		 * Inform that the notification is closed (without user action)
		 * @event
		 * @param {Object} inSender Event's sender
		 * @param {Object} inEvent <tt>inEvent.notification</tt> contains the notification object passed in the <q>newNotification</q> method and <tt>inEvent.uid</tt> the uid
		 * @see enyojs.com for more information about events
		 */
		onClose: ""
	},

	/**
	 * The list of waiting notification
	 * @field
	 * @type Array
	 * @private
	 * @default <tt>[]</tt>
	 * @name notification.Badged#pending
	 */
	pending: [],

	/**
	 * The behavoir of adding a notification
	 * @field
	 * @type Boolean
	 * @default false
	 */
	fifo: false,

	/**
	 * The components of the object
	 * @field
	 * @ignore
	 * @type Array
	 * @default The notification visual
	 * @name notification.Badged#components
	 */
	components: [
		{kind: "enyo.Control", ontap: "notifTap", name: "bubble", classes: "notification-badged-bubble", showing: false, components: [
			{kind: "enyo.Control", name: "icon", classes: "notification-badged-icon"},
			{kind: "enyo.Control", name: "title", classes: "notification-badged-title"},
			{kind: "enyo.Control", name: "message", classes: "notification-badged-message"},
			{kind: "enyo.Control", name: "badge", classes: "notification-badged-badge", showing: false},
		]}
	],

	/**
	 * Create function, init the object
	 * @function
	 * @private
	 * @name notification.Badged#create
	 */
	create: function() {
		this.inherited(arguments);
		this.render();//Render the node
	},

	/**
	 * Add a notification to the list
	 * @function
	 * @param {Object} notification An object that contains all data about the notification (<tt>icon</tt>, <tt>title</tt>, <tt>message</tt>, <tt><i>stay</i></tt>, <tt><i>duration</i></tt>)
	 * @name notification.Badged#newNotification
	 */
	newNotification: function(notification, uid) {
		this.pending.push({
			uid: uid,
			notification: notification,
		});
		
		if(this.pending.length == 1) {//If pending length is now 1, the "bubble" is not displayed
			this.$.bubble.show();
		}

		this.displayNotification();//Display the next notification
	},
	
	/**
	 * Display the next notification
	 * @function
	 * @private
	 * @name notification.Badged#displayNotification
	 */
	displayNotification: function() {
		if(this.pending.length == 0) return;

		var last = this.upNotif().notification;//Get data about notification to display

		//Remove waiting job
		if(!this.fifo) enyo.job.stop("hideNotification-Badged");
		
		//Update data
		this.$.badge.setContent(this.pending.length);
			this.$.badge.setShowing(this.pending.length > 1);
		this.$.title.setContent(last.title);
		this.$.message.setContent(last.message);
		this.$.icon.applyStyle('background-image', "url('"+last.icon+"')");
		
		if(!last.stay) {
			enyo.job(//Close the notification in x seconde
				"hideNotification-Badged",
				enyo.bind(this, "hideNotification"),
				(last.duration)?last.duration*1000:this.defaultDuration
			);
		}
	},
	
	/**
	 * Hide the current notification
	 * @function
	 * @private
	 * @param {Boolean} isTap <tt><b>true</b></tt> if the function what call after a tap
	 * @name notification.Badged#hideNotification
	 */
	hideNotification: function(isTap) {
		enyo.job.stop("hideNotification-Badged");
		if(!isTap) { this.doClose({notification: this.upNotif().notification, uid: this.upNotif().uid}); }
		
		enyo.remove(this.upNotif(), this.pending);
		
		if(this.pending.length > 0) {
			this.displayNotification();
		}
		else {
			this.$.bubble.hide();
		}
	},
	
	/**
	 * Handler for <q>onTap</q> event
	 * @function
	 * @private
	 */
	notifTap: function() {
		this.doTap({notification: this.upNotif().notification, uid: this.upNotif().uid})
		this.hideNotification();
	},
	
	/**
	 * Return the notification displayed or to display, according to FIFO or not
	 * @function
	 * @private
	 * @returns the pending notification
	 * @type Object
	 * @name notification.Badged#upNotif
	 */
	upNotif: function() {
		return this.fifo?this.pending[0]:this.pending[this.pending.length-1];
	},
	
	/**
	 * Remove a notification
	 * @function
	 * @name notification.Badged#removeNotification
	 * @param {Int} The uid of the notification to remove
	 */
	removeNotification: function(uid) {
		var lap = 0,
			total = this.pending.length;
			
		for(;lap<total;lap++) {
			if(this.upNotif().uid == uid) {
				this.hideNotification(true);
			}
			else {
				enyo.remove(this.getNotificationFromUid(uid), this.pending);
				this.$.badge.setContent(this.pending.length);
				this.$.badge.setShowing(this.pending.length > 1);
			}
		}
	},
	
	/**
	 * Return a notification by a its Uid
	 * @function
	 * @private
	 * @returns A notification
	 * @param {Int} uid The Uid of the notification
	 * @name notification.Badged#getNotificationFromUid
	 */
	getNotificationFromUid: function(uid) {
		var lap = 0,
			total = this.pending.length;
			
		for(;lap<total;lap++) {
			if(this.pending[lap].uid == uid) return this.pending[lap];
		}
	}
});