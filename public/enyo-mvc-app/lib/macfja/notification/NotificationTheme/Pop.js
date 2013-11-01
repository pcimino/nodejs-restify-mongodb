/**
 * Notification theme
 * @see http://enyojs.com
 * @name notification
 * @namespace
 */

/**
 * Notification that "pop" on screen (similar to iOS message)
 * @name notification.Pop
 * @class
 * @author MacFJA
 * @version 1.2 (27/09/2013)
 */
enyo.kind({
	name: "notification.Pop",
	kind: "enyo.Control",

	published: {
		/** @lends notification.Pop# */
		/**
		 * The default duration time (in millisec) for notification, use if no duration is specified (use getter/setter)
		 * @field
		 * @type Number
		 * @default 2000
		 * @name notification.Pop#defaultDuration
		 */
		defaultDuration: 2000
	},

	events: {
		/** @lends notification.Pop# */
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
	 * @name notification.Pop#pending
	 */
	pending: [],

	/**
	 * The components of the object
	 * @field
	 * @ignore
	 * @type Array
	 * @default The notification visual and an Animators
	 * @name notification.Pop#components
	 */
	components: [
		{kind: "enyo.Control", ontap: "notifTap", showing: false, name: "bubble", classes: "notification-pop-bubble", components: [
			{kind: "enyo.Control", name: "master", components: [
				{kind: "enyo.Control", name: "title", classes: "notification-pop-title"},
				{kind: "enyo.Control", name: "message", classes: "notification-pop-message"},
				{kind: "enyo.Control", name: "icon", classes: "notification-pop-icon"}
			]}
		]},
		{
			kind: "enyo.Animator",
			easingFunction: enyo.easing.cubicIn,
			name: "popUp1",
			startValue: 0,
			endValue: 1.1,
			duration: 900,
			onStep: "zoomEffect",
			onEnd: "endEffect"
		},
		{
			kind: "enyo.Animator",
			name: "popUp2",
			startValue: 1.1,
			endValue: 1,
			duration: 300,
			onStep: "zoomEffect",
			onEnd: "endEffect"
		},
		{
			kind: "enyo.Animator",
			easingFunction: enyo.easing.cubicIn,
			name: "zoom",
			startValue: 0,
			endValue: 1,
			duration: 750,
			onStep: "zoomOutEffect",
			onEnd: "endEffect"
		}
	],

	/**
	 * Create function, init the object
	 * @function
	 * @private
	 * @name notification.Pop#create
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
	 * @name notification.Pop#newNotification
	 */
	newNotification: function(notification, uid) {
		this.pending.push({
			uid: uid,
			notification: notification,
		});

		if(this.pending.length == 1) {//If pending length is now 1, the "bubble" is not displayed
			this.$.bubble.show();
			this.displayNotification();
		}
	},

	/**
	 * Display the next notification
	 * @function
	 * @private
	 * @name notification.Pop#displayNotification
	 */
	displayNotification: function() {
		if(this.pending.length == 0) return;

		//Build the notification
		var notif = this.pending[0].notification;
		this.$.title.setContent(notif.title);
		this.$.message.setContent(notif.message);
		this.$.icon.applyStyle('background-image', "url('"+notif.icon+"')");

		this.$.popUp1.play();//Start the animation (part 1/2)
	},

	/**
	 * Hide the current notification
	 * @function
	 * @private
	 * @param {Boolean} isTap <tt><b>true</b></tt> if the function what call after a tap
	 * @name notification.Pop#hideNotification
	 */
	hideNotification: function(isTap) {
		enyo.job.stop("hideNotification-Pop");
		if(!isTap) { this.doClose({notification: this.pending[0].notification, uid: this.pending[0].uid}); }

		this.$.zoom.play();
	},

	/**
	 * Handler for <q>onStep</q> event of popUp1 and popUp2 - Animation step for showing notification
	 * @function
	 * @private
	 * @param {Object} inSender The animator object
	 */
	zoomEffect: function(inSender) {
		var value = inSender.value.toFixed(8);
		this.$.bubble.applyStyle("opacity", value);

		if(enyo.Layout.transform)//Enyo 2.0b3
			{ enyo.Layout.transform(this.$.bubble, {"scale": value}); }
		else if(enyo.dom.transformValue)//Enyo GitHub (22/04/2012)
			{ enyo.dom.transformValue(this.$.bubble, "scale", value); }
		/*
			"toFixed(8)" is use to avoid some "flashing" bug when opacity is near 0 and the exponential notation is used,
			i.e. 7.999999995789153e-9,
			because CSS don't understand exponential notation
		*/

	},

	/**
	 * Handler for <q>onStep</q> event of zoom - Animation step for hidding notification
	 * @function
	 * @private
	 * @param {Object} inSender The animator object
	 */
	zoomOutEffect: function(inSender) {
		var value = inSender.value.toFixed(8);
		this.$.bubble.applyStyle("opacity", 1-value);

		if(enyo.Layout.transform)//Enyo 2.0b3
			{ enyo.Layout.transform(this.$.bubble, {"scale": 1+value*5}); }
		else if(enyo.dom.transformValue)//Enyo GitHub (22/04/2012)
			{ enyo.dom.transformValue(this.$.bubble, "scale", 1+value*5); }

		var masterValue = 1-value*2;
			if(masterValue < 0) masterValue = 0;
		this.$.master.applyStyle("opacity", masterValue.toFixed(8));
		/*
			"toFixed(8)" is use to avoid some "flashing" bug when opacity is near 0 and the exponential notation is used,
			i.e. 7.999999995789153e-9,
			because CSS don't understand exponential notation
		*/
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
	 * Handler for "onEnd" event of Animators
	 * @function
	 * @private
	 */
	endEffect: function(inSender) {
		if(inSender.name == "popUp1") {
			this.$.popUp2.play();//The first part of showing animation end, start part 2/2
		}
		else if(inSender.name == "popUp2") {
			var notif = this.pending[0].notification;
			if(!notif.stay) {
				enyo.job(//Close the notification in x seconde
					"hideNotification-Pop",
					enyo.bind(this, "hideNotification"),
					(notif.duration)?notif.duration*1000:this.defaultDuration
				);
			}
		}
		else {
			this.pending.shift();//Remove the first pending element (FIFO)
			this.$.master.applyStyle("opacity", 1);
			if(this.pending.length == 0) {
				this.$.bubble.hide();//No more notification
			}
			else {
				this.displayNotification();//Display the next notification
			}
		}
	},
	
	/**
	 * Remove a notification
	 * @function
	 * @name notification.Pop#removeNotification
	 * @param {Int} The uid of the notification to remove
	 */
	removeNotification: function( uid) {
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
	 * @name notification.Pop#getNotificationFromUid
	 */
	getNotificationFromUid: function(uid) {
		var lap = 0,
			total = this.pending.length;
			
		for(;lap<total;lap++) {
			if(this.pending[lap].uid == uid) return this.pending[lap];
		}
	}
});