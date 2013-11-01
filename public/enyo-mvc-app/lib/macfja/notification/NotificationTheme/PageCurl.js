/**
 * Notification theme
 * @see http://enyojs.com
 * @name notification
 * @namespace
 */

/**
 * Notification theme, with separate stay and unstay notification
 * @name notification.PageCurl
 * @class
 * @author MacFJA
 * @version 1.1 (27/09/2013)
 */
enyo.kind({
	name: "notification.PageCurl",
	kind: "enyo.Control",

	published: {
		/** @lends notification.PageCurl# */
		/**
		 * The default duration time (in millisec) for notification, use if no duration is specified (use getter/setter)
		 * @field
		 * @type Number
		 * @default 2000
		 * @name notification.PageCurl#defaultDuration
		 */
		defaultDuration: 2000
	},

	events: {
		/** @lends notification.PageCurl# */
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
	 * @name notification.PageCurl#pending
	 */
	pending: [],

	/**
	 * The node that is displayed or is about to be displayed
	 * @field
	 * @type Object
	 * @default <tt><b>null</b></tt>
	 * @private
	 * @name notification.PageCurl#inShow
	 */
	inShow: null,

	/**
	 * Is the page curl visible?
	 * @field
	 * @type Boolean
	 * @default false
	 * @private
	 * @name notification.PageCurl#cornerVisible
	 */
	cornerVisible: false,
	
	/**
	 * Is the message bar visible
	 * @field
	 * @type Boolean
	 * @default false
	 * @private
	 * @name notification.PageCurl#barVisible
	 */
	barVisible: false,

	/**
	 * The components of the object
	 * @field
	 * @ignore
	 * @type Array
	 * @default The notification visual and an Animators
	 * @name notification.PageCurl#components
	 */
	components: [
		{kind: "enyo.Animator", duration: 1000, startValue: 0, endValue: 1, onStep: "stepCornerShow", onEnd: "animationEnd", name: "showCornerAnimation"},
		{kind: "enyo.Animator", duration: 1000, startValue: 0, endValue: 1, onStep: "stepCornerHide", onEnd: "animationEnd", name: "hideCornerAnimation"},
		{kind: "enyo.Animator", duration: 1000, startValue: 0, endValue: 1, onStep: "stepCornerAll", onEnd: "animationEnd", name: "allCornerAnimation"},
		{kind: "enyo.Animator", duration: 1000, startValue: 0, endValue: 100, onStep: "stepBarShow", onEnd: "animationEnd", name: "showBarAnimation"},
		{kind: "enyo.Animator", duration: 1000, startValue: 0, endValue: 80, onStep: "stepBarHide", onEnd: "animationEnd", name: "hideBarAnimation"},
		{kind: "enyo.Animator", duration: 1000, startValue: 0, endValue: 1, onStep: "stepLiveShow", onEnd: "animationEnd", name: "showLiveAnimation"},
		{kind: "enyo.Animator", duration: 1000, startValue: 1, endValue: 0, onStep: "stepLiveHide", onEnd: "animationEnd", name: "hideLiveAnimation"},
		
		{kind: "enyo.Control", name: "curl", classes: "notification-pagecurl-curl", ontap: "curlTap", components: [
			{kind: "enyo.Control", name: "count", content: "0", classes: "notification-pagecurl-curl-count"}
		]},
		{kind: "enyo.Control", name: "bar", classes: "notification-pagecurl-messagebar", components: [
			{kind: "onyx.IconButton", classes: "notification-pagecurl-messagebar-close", ontap: "barCloseTap"},
			{kind: "enyo.Scroller", name: "scroller", classes: "notification-pagecurl-messagebar-scroller", vertical: "hidden", horizontal: "auto"},
		]},
		{ kind: "enyo.Control", showing: false, name: "message", classes: "notification-pagecurl-message", ontap: "liveClose", components: [
			{ kind: "enyo.Image", name: "icon"},
			{ kind: "enyo.Control", name: "title", content: "My title", classes: "notification-pagecurl-message-title"},
			{ kind: "enyo.Control", name: "text", content: "My text", classes: "notification-pagecurl-message-text"}
		]}
	],

	/**
	 * Create function, init the object
	 * @function
	 * @private
	 * @name notification.PageCurl#create
	 */
	create: function() {
		this.inherited(arguments);
		this.render();
	},

	/**
	 * Add a notification to the list
	 * @function
	 * @param {Object} notification An object that contains all data about the notification (<tt>icon</tt>, <tt>title</tt>, <tt>message</tt>, <tt><i>stay</i></tt>, <tt><i>duration</i></tt>)
	 * @name notification.PageCurl#newNotification
	 */
	newNotification: function(notification, uid) {
		this.pending.push({
			uid: uid,
			notification: notification,
			node: null
		});

		if(notification.stay) {
			this.newStayNotif(this.pending[this.pending.length-1]);
		}
		else {
			this.newLiveNotif();
		}
	},

	/**
	* Return the count of pending stay notification
	* @function
	* @private
	* @name notification.PageCurl#getStayCount
	* @returns {Number} The count of stay notification
	*/
	getStayCount: function() {
		var count = 0;
		for (var tour=0; tour < this.pending.length; tour++) {
			if(this.pending[tour].notification.stay) count++;
		};
		
		return count;
	},

	/**
	 * Update count badge and display corner if needed
	 * @function
	 * @private
	 * @name notification.PageCurl#showCorner
	 */
	showCorner: function() {
		//Update badge count
		var count = this.getStayCount();
		this.$.count.setContent(count);
		
		//Display corner?
		if(count > 0 && !this.cornerVisible && !this.barVisible) {
			this.$.showCornerAnimation.play();
		}
	},
	
	/**
	 * Add a new stay notification to the bar
	 * @function
	 * @private
	 * @param {Object} notification The stay notification
	 * @name notification.PageCurl#newStayNotif
	 */
	newStayNotif: function(notification) {
		//Append message to message bar
		notification.node = this.$.scroller.createComponent({
			kind: "enyo.Control",
			classes: "notification-pagecurl-messagebar-message",
			ontap: "stayClose",
			refNotification: notification,
			components: [
				{kind: "enyo.Image", attributes: {src: notification.notification.icon}},
				{kind: "enyo.Control", content: notification.notification.title, classes: "notification-pagecurl-messagebar-message-title"},
				{kind: "enyo.Control", content: notification.notification.message, classes: "notification-pagecurl-messagebar-message-text"}
			]
		}, {owner: this});
		this.$.scroller.render();
		
		this.showCorner();
	},

	/**
	 * Display the next "live" (unstay) notification
	 * @function
	 * @private
	 * @name notification.PageCurl#newLiveNotif
	 */
	newLiveNotif: function() {
		if(this.inShow != null) return;
		
		for (var tour=0; tour < this.pending.length; tour++) {
			if(this.inShow == null && !this.pending[tour].notification.stay)
				{ this.inShow = this.pending[tour]; }
		};
		if(this.inShow == null) return;
		
		this.$.title.setContent(this.inShow.notification.title);
		this.$.text.setContent(this.inShow.notification.message);
		this.$.icon.setAttribute("src", this.inShow.notification.icon);
		
		this.$.message.applyStyle("opacity", 0);
		this.$.message.applyStyle("display", "block");
		this.$.message.applyStyle("top", this.barVisible?"80px":"0px");

		this.$.showLiveAnimation.play();
		
	},
	
	/**
	 * Hide a live notification
	 * @private
	 * @function
	 * @param {Boolean} isTap set to <code>true</code> if the notification have been tapped
	 * @name notification.PageCurl#hideNotification
	 */
	hideNotification: function(isTap) {
		enyo.job.stop("hideNotification-PageCurl");//Stop hideNotification-PageCurl job (that will exist on tap action)
		if(!isTap) { this.doClose({notification: this.inShow.notification, uid: this.inShow.uid}); }//If call after a tap, inform notification

		this.$.showLiveAnimation.stop();//Stop animation
		this.$.hideLiveAnimation.play();//Start the animation
	},
	
	/**
	 * Handler for "onStep" event of showCornerAnimation
	 * @private
	 */
	stepCornerShow: function(inSender) {
		var from = {x: -150, y: -120},
			delta = {x: 115, y: 120};
		
		this.$.curl.applyStyle("right", from.x+delta.x*inSender.value+"px");
		this.$.curl.applyStyle("top", from.y+delta.y*inSender.value+"px");
	},
	
	/**
	 * Handler for "onStep" event of hideCornerAnimation
	 * @private
	 */
	stepCornerHide: function(inSender) {
		var from = {x: -35, y: 0},
			delta = {x: -115, y: -120};
		
		this.$.curl.applyStyle("right", from.x+delta.x*inSender.value+"px");
		this.$.curl.applyStyle("top", from.y+delta.y*inSender.value+"px");
	},
	
	/**
	 * Handler for "onStep" event of allCornerAnimation
	 * @private
	 */
	stepCornerAll: function(inSender) {
		var from = -35,
			delta = 35;
		
		this.$.curl.applyStyle("right", from+delta*inSender.value+"px");
	},
	
	/**
	 * Handler for "onStep" event of showBarAnimation
	 * @private
	 */
	stepBarShow: function(inSender) {
		this.$.curl.applyStyle("right", inSender.value+"%");
		this.$.bar.applyStyle("left", (100-inSender.value)+"%");
	},
	
	/**
	 * Handler for "onStep" event of hideBarAnimation
	 * @private
	 */
	stepBarHide: function(inSender) {
		this.$.bar.applyStyle("top", -inSender.value+"px");
	},
	
	/**
	 * Handler for "onStep" event of showLiveAnimation
	 * @private
	 */
	stepLiveShow: function(inSender) {
		this.$.message.applyStyle("opacity", inSender.value.toFixed(8));
	},
	
	/**
	 * Handler for "onStep" event of hideLiveAnimation
	 * @private
	 */
	stepLiveHide: function(inSender) {
		this.$.message.applyStyle("opacity", inSender.value.toFixed(8));
	},
	
	/**
	 * Handler for "onEnd" event of all animator
	 * @private
	 */
	animationEnd : function(inSender) {
		if(inSender == this.$.allCornerAnimation)
		{
			this.$.showBarAnimation.play();
		}
		else if(inSender == this.$.showBarAnimation) {
			this.cornerVisible = false;
			this.barVisible = true;
		}
		else if(inSender == this.$.hideBarAnimation) {
			this.barVisible = false;
			this.$.bar.applyStyle("left", "100%");
			this.$.bar.applyStyle("top", "0px");
			this.showCorner();
		}
		else if(inSender == this.$.showLiveAnimation) {
			enyo.job(//Close the notification in x seconde
				"hideNotification-PageCurl",
				enyo.bind(this, "hideNotification"),
				(this.inShow.notification.duration)?this.inShow.notification.duration*1000:this.defaultDuration
			);
		}
		else if(inSender == this.$.hideLiveAnimation) {
			enyo.remove(this.inShow, this.pending);
			this.inShow = null;
			this.$.message.applyStyle("display", "none");
			this.newLiveNotif();
		}
		else if(inSender == this.$.showCornerAnimation) {
			this.cornerVisible = true;
		}
		else if(inSender == this.$.hideCornerAnimation) {
			this.cornerVisible = false;
			this.barVisible = false;
		}
	},

	/**
	 * Handler for "onTap" event of curl
	 * @private
	 */
	curlTap: function(inSender, inEvent) {
		if(this.$.showCornerAnimation.isAnimating()) {
			this.$.showCornerAnimation.stop();
			this.$.curl.applyStyle("top", "0px");
		}
		
		this.$.showBarAnimation.play();
	},
	
	/**
	 * Handler for "onTap" event of message
	 * @private
	 */
	liveClose: function() {
		this.doTap({notification: this.inShow.notification, uid: this.inShow.uid});
		this.hideNotification(true, this.inShow);
		
		return true;
	},
	
	/**
	 * Handler for "onTap" event of a stay message
	 * @private
	 */
	stayClose: function(inSender) {
		var n = inSender.refNotification;
		this.doTap({notification: n.notification, uid: n.uid});
		enyo.remove(n, this.pending);
		inSender.destroy();

		if(this.getStayCount() == 0) this.barCloseTap();

		return true;
	},
	
	/**
	 * Handler for "onTap" event of close
	 * @private
	 */
	barCloseTap: function() {
		this.$.allCornerAnimation.stop();
		this.$.hideBarAnimation.play();
	},
	
	/**
	 * Remove a notification
	 * @function
	 * @name notification.PageCurl#removeNotification
	 * @param {Int} The uid of the notification to remove
	 */
	removeNotification: function(uid) {
		var notif = this.getNotificationFromUid(uid);

		if(!notif.notification.stay) {
			if(notif == this.inShow) {
				this.hideNotification(true);
			}
		}
		else {
			notif.node.destroy();
		}
		enyo.remove(notif, this.pending);
		
		this.showCorner();
		if(this.barVisible) {
			if(this.getStayCount() == 0) this.barCloseTap();
		}
		else {
			if(this.getStayCount() == 0 && this.cornerVisible) this.$.hideCornerAnimation.play();
		}
		
	},
	
	/**
	 * Return a notification by a its Uid
	 * @function
	 * @private
	 * @returns A notification
	 * @param {Int} uid The Uid of the notification
	 * @name notification.PageCurl#getNotificationFromUid
	 */
	getNotificationFromUid: function(uid) {
		var lap = 0,
			total = this.pending.length;
			
		for(;lap<total;lap++) {
			if(this.pending[lap].uid == uid) return this.pending[lap];
		}
	}
});