/**
 * Notification theme
 * @see http://enyojs.com
 * @name notification
 * @namespace
 */

/**
 * Notification bar style like webOS phone
 * @name notification.MessageBar
 * @class
 * @author MacFJA
 * @version 1.2 (27/09/2013)
 */
enyo.kind({
	name: "notification.MessageBar",
	kind: "enyo.Control",

	published: {
		/** @lends notification.MessageBar# */
		/**
		 * The default duration time (in millisec) for notification, use if no duration is specified (use getter/setter)
		 * @field
		 * @type Number
		 * @default 2000
		 * @name notification.MessageBar#defaultDuration
		 */
		defaultDuration: 2000
	},

	events: {
		/** @lends notification.MessageBar# */
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
	 * @name notification.MessageBar#pending
	 */
	pending: [],

	/**
	 * Is a notification displayed?
	 * @field
	 * @type Boolean
	 * @private
	 * @default false
	 * @name notification.MessageBar#hasDisplayedNotif
	 */

	hasDisplayedNotif: false,

	/**
	 * The node that is displayed or is about to be displayed
	 * @field
	 * @type Object
	 * @default <tt><b>null</b></tt>
	 * @private
	 * @name notification.MessageBar#inShow
	 */
	inShow: null,

	/**
	 * The note that is about to be hidden
	 * @field
	 * @type Object
	 * default <tt><b>null</b></tt>
	 * @private
	 * @name notification.MessageBar#inHide
	 */
	inHide: null,

	/**
	 * The components of the object
	 * @field
	 * @ignore
	 * @type Array
	 * @default The notification visual and an Animators
	 * @name notification.MessageBar#components
	 */
	components: [
		{kind: "enyo.Animator", duration: 1000, endValue: 1, onStep: "msgStep", onEnd: "animationEnd", name: "showNotif"},
		{kind: "enyo.Animator", duration: 1000, startValue: 1, endValue: 0, onStep: "msgStep", onEnd: "animationEnd", name: "hideNotif"},
		{kind: "enyo.Animator", duration: 1000, endValue: 30, onStep: "barStep", onEnd: "animationEnd", name: "barAnimator"},
		{kind: "enyo.Control", name: "bar", classes: "notification-messagebar-bar"}
	],

	/**
	 * Create function, init the object
	 * @function
	 * @private
	 * @name notification.MessageBar#create
	 */
	create: function() {
		this.inherited(arguments);
		this.render();
	},

	/**
	 * Add a notification to the list
	 * @function
	 * @param {Object} notification An object that contains all data about the notification (<tt>icon</tt>, <tt>title</tt>, <tt>message</tt>, <tt><i>stay</i></tt>, <tt><i>duration</i></tt>)
	 * @name notification.MessageBar#newNotification
	 */
	newNotification: function(notification, uid) {
		this.pending.push({
			uid: uid,
			notification: notification,
			node: null
		});

		if(this.pending.length == 1) {
			this.$.barAnimator.play();//If is the first, the bar must be displayed first
		}
	},

	/**
	 * Display the next notification
	 * @function
	 * @private
	 * @name notification.MessageBar#displayNotification
	 */
	displayNotification: function() {
		if(this.pending.length == 0) return;

		//Build the notification
		var n = this.inShow.notification;
		this.inShow.node = this.$.bar.createComponent({
			kind: "enyo.Control",
			classes: "notification-messagebar-notification",
			components: [
				{kind: "enyo.Control", classes: "notification-messagebar-icon", style:"background-image: url('"+n.icon+"')"},
				{kind: "enyo.Control", classes: "notification-messagebar-title", content: n.title},
				{kind: "enyo.Control", classes: "notification-messagebar-message", content:n.message}
			],
			ontap: "notifTap"
		}, {owner: this});

		//Set start style (prevent "flashing")
		this.inShow.node.applyStyle("top", "30px");
		this.inShow.node.applyStyle("opacity", "0");

		//Render the node
		this.inShow.node.render();
		this.hasDisplayedNotif = true;//Now we have a notification
		this.$.showNotif.play();//Launch the animation
	},

	/**
	 * Hide the current notification
	 * @function
	 * @private
	 * @param {Boolean} isTap <tt><b>true</b></tt> if the function what call after a tap
	 * @name notification.MessageBar#hideNotification
	 */
	hideNotification: function(isTap) {
		enyo.job.stop("hideNotification-MessageBar");//Stop hideNotification-Bezel job (that will exist on tap action)
		if(!isTap) { this.doClose({notification: this.pending[0].notification, uid: this.pending[0].uid}); }//If call after a tap, inform notification

		if(this.pending.length > 1) {//If exist notification in pending list (more than one, because the actual notification is still existing)
			this.inShow = this.pending[1];//Change inShow notification
			this.displayNotification();//Start displaying the next notification
		}
		else {
			this.hasDisplayedNotif = false;//No more notification is displayed
		}
		this.inHide = this.pending[0];//Set the node that will disappear as the fisrt of the pending list (FIFO)
		this.$.hideNotif.play();//Start animation
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
	 * Handler for <q>onStep</q> event of showNotif and hideNotif - Animation step for message
	 * @function
	 * @private
	 * @param {Object} inSender The animator object
	 */
	msgStep: function(inSender) {
		var value,
			node;

		//Select the right node
		if(inSender.name == "showNotif")
			{ node = this.inShow.node; }
		else
			{ node = this.inHide.node; }

		value = inSender.value;
		node.applyStyle("opacity", value.toFixed(8));
		node.applyStyle("top", (30-value*30).toFixed(8)+"px");
		/*
			"toFixed(8)" is use to avoid some "flashing" bug when opacity is near 0 and the exponential notation is used,
			i.e. 7.999999995789153e-9,
			because CSS don't understand exponential notation
		*/
	},

	/**
	 * Handler for <q>onStep</q> event of barAnimator - Animation step for bar
	 * @function
	 * @private
	 * @param {Object} inSender The animator object
	 */
	barStep: function(inSender) {
		var value,
			node;

		if(this.pending.length == 0)//From 0 to -30px
			{ value = -inSender.value; }
		else//From -30px to 0
			{ value = -30+inSender.value; }
		this.$.bar.applyStyle("bottom", value.toFixed(8)+"px");
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
	animationEnd: function(inSender) {
		if(inSender.name == "hideNotif") {
			//The animator is the one for hide a notification
			this.inHide.node.destroy();//Destroy the node
			this.pending.shift();//Remove the first notification (FIFO)
			this.inHide = null;//Set inHide to null
			if(this.pending.length == 0) {
				this.$.barAnimator.play();//If no more notification, hide the bar
			}
			else if(!this.hasDisplayedNotif) {
				/*
					If a notification has been send after the last call of hideNotification, during the animation,
					it will not appear because displayNotification is call in hideNotification.
				*/
				this.inShow = this.pending[0];
				this.displayNotification();
			}
		}
		else if(inSender.name == "barAnimator" && this.pending.length) {//barAnimator and waiting notification = the opening of the bar is ended
			this.inShow = this.pending[0];
			this.displayNotification();
		}
		else if(inSender.name == "showNotif") {
			if(!this.inShow.notification.stay) {
				enyo.job(//Close the notification in x seconde
					"hideNotification-MessageBar",
					enyo.bind(this, "hideNotification"),
					(this.inShow.notification.duration)?this.inShow.notification.duration*1000:this.defaultDuration
				);
			}
		}
	},
	
	/**
	 * Remove a notification
	 * @function
	 * @name notification.MessageBar#removeNotification
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
	 * @name notification.MessageBar#getNotificationFromUid
	 */
	getNotificationFromUid: function(uid) {
		var lap = 0,
			total = this.pending.length;
			
		for(;lap<total;lap++) {
			if(this.pending[lap].uid == uid) return this.pending[lap];
		}
	}
});