/**
 * Notification theme
 * @see http://enyojs.com
 * @name notification
 * @namespace
 */

/**
 * Bezel notification style
 * @name notification.Bezel
 * @class
 * @author MacFJA
 * @version 1.2 (27/09/2013)
 */
enyo.kind({
	name: "notification.Bezel",
	kind: "enyo.Control",

	published: {
		/** @lends notification.Bezel# */
		/**
		 * The default duration time (in millisec) for notification, use if no duration is specified (use getter/setter)
		 * @field
		 * @type Number
		 * @default 2000
		 * @name notification.Bezel#defaultDuration
		 */
		defaultDuration: 2000
	},

	events: {
		/** @lends notification.Bezel# */
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
	 * @name notification.Bezel#pending
	 */
	pending: [],
	/**
	 * Inform if the notification is appearing or not (<tt><b>true</b></tt> is appearing, <tt><b>false</b></tt> otherwise)
	 * @field
	 * @type Array
	 * @private
	 * @default <tt>[]</tt>
	 * @name notification.Bezel#isShow
	 */
	isShow: true,

	/**
	 * The components of the object
	 * @field
	 * @ignore
	 * @type Array
	 * @default The notification visual and an Animator
	 * @name notification.Bezel#components
	 */
	components: [
		{
			kind: "enyo.Control",
			classes: "notification-bezel-main",
			name: "bubble",
			showing: false,
			components: [
				{kind: "enyo.Control", name: "icon", classes: "notification-bezel-icon"},
				{kind: "enyo.Control", name: "title", classes: "notification-bezel-title"},
				{kind: "enyo.Control", name: "message", classes: "notification-bezel-message"}
			],
			ontap: "notifTap"
		},
		{kind: "enyo.Animator", duration: 1000, endValue: 1, onStep: "fadeAnimation", onEnd: "animationEnd", name: "animator"}
	],

	/**
	 * Create function, init the object
	 * @function
	 * @private
	 * @name notification.Bezel#create
	 */
	create: function() {
		this.inherited(arguments);
		this.render();//Render the node
		this.$.bubble.applyStyle("opacity", 0);//Set default style (prevent flashing)
	},

	/**
	 * Add a notification to the list
	 * @function
	 * @param {Object} notification An object that contains all data about the notification (<tt>icon</tt>, <tt>title</tt>, <tt>message</tt>, <tt><i>stay</i></tt>, <tt><i>duration</i></tt>)
	 * @name notification.Bezel#newNotification
	 */
	newNotification: function(notification, uid) {
		this.pending.push({uid: uid, notification: notification});

		if(this.pending.length == 1) {//If pending length is now 1, the "bubble" is not displayed
			this.$.bubble.show();
			this.displayNotification();
		}
	},

	/**
	 * Display the next notification
	 * @function
	 * @private
	 * @name notification.Bezel#displayNotification
	 */
	displayNotification: function() {
		if(this.pending.length == 0){
			//Nothing to display!
			this.$.bubble.hide();//Hide the "bubble"
			return;//Stop function
		}

		//Build the notification
		var notif = this.pending[0].notification;
		this.$.title.setContent(notif.title);
		this.$.message.setContent(notif.message);
		this.$.icon.applyStyle('background-image', "url('"+notif.icon+"')");

		this.$.animator.stop();//Stop animation
		this.isShow = true;//Set the type of animation
		this.$.animator.play();//Start the animation
	},

	/**
	 * Hide the current notification
	 * @function
	 * @private
	 * @param {Boolean} isTap <tt><b>true</b></tt> if the function what call after a tap
	 * @name notification.Bezel#hideNotification
	 */
	hideNotification: function(isTap) {
		enyo.job.stop("hideNotification-Bezel");//Stop hideNotification-Bezel job (that will exist on tap action)
		if(!isTap) { this.doClose({notification: this.pending[0].notification, uid: this.pending[0].uid}); }//If call after a tap, inform notification

		this.$.animator.stop();//Stop animation
		this.isShow = false;//Set the type of animation
		this.$.animator.play();//Start the animation
	},

	/**
	 * Handler for <q>onTap</q> event
	 * @function
	 * @private
	 */
	notifTap: function() {
		this.doTap({notification: this.pending[0].notification, uid: this.pending[0].uid})
		this.hideNotification();
	},

	/**
	 * Handler for <q>onStep</q> event of Animator - Animation step
	 * @function
	 * @private
	 * @param {Object} inSender The animator object
	 */
	fadeAnimation: function(inSender) {
		var opacity;
		if(this.isShow)
			{ opacity = inSender.value; }//from 0 to 1
		else
			{ opacity = 1-inSender.value; }//from 1 to 0

		this.$.bubble.applyStyle("opacity", opacity.toFixed(8));
		/*
			"toFixed(8)" is use to avoid some "flashing" bug when opacity is near 0 and the exponential notation is used,
			i.e. 7.999999995789153e-9,
			because CSS don't understand exponential notation
		*/
	},

	/**
	 * Handler for "onEnd" event of Animator
	 * @function
	 * @private
	 */
	animationEnd: function() {
		if(!this.isShow) {//The notification is now hidden
			this.pending.shift();//Remove the first pending element (FIFO)
			enyo.asyncMethod(this, "displayNotification");//Defer the displayNotification method
		}
		else {
			if(!this.pending[0].notification.stay) {
				enyo.job(//Close the notification in x seconde
					"hideNotification-Bezel",
					enyo.bind(this, "hideNotification"),
					(this.pending[0].notification.duration)?this.pending[0].notification.duration*1000:this.defaultDuration
				);
			}
		}
	},

	/**
	 * Remove a notification
	 * @function
	 * @name notification.Bezel#removeNotification
	 * @param {Int} The uid of the notification to remove
	 */
	removeNotification: function(uid) {
		if(uid == this.pending[0].uid) {
			this.hideNotification(true);
		}

		enyo.remove(this.getNotificationFromUid(uid), this.pending);
	},

	/**
	 * Return a notification by a its Uid
	 * @function
	 * @private
	 * @returns A notification
	 * @param {Int} uid The Uid of the notification
	 * @name notification.Bezel#getNotificationFromUid
	 */
	getNotificationFromUid: function(uid) {
		var lap = 0,
			total = this.pending.length;

		for(;lap<total;lap++) {
			if(this.pending[lap].uid == uid) return this.pending[lap];
		}
	}
});