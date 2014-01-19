/**
 * Enyo UI
 * @see http://enyojs.com
 * @name enyo
 * @namespace
 */

/**
 * Dynamic loaded list
 * <hr />
 * <h2>Notification format</h2>
 * Notification send with enyo.Notification#sendNotification respect the format :
 * <ul>
 *  <li><code>title</code>: The title of the notification (The main information)</li>
 *  <li><code>message</code>: The message of the notification (A description/explanation)</li>
 *  <li><code>icon</code>: The icon of the notification (ex. warning icon, stop icon)</li>
 *  <li><code>duration</code>: How long did the notification stay on screen (in seconds)</li>
 *  <li><code>stay</code>: if <code>true</code> the notification will disappear only if user click on it</li>
 *  <li><code>theme</code>: The name of the theme to use to render notification</li>
 * </ul>
 * Example :
 * <pre>{title: "Alert", message: "Your battery is low", icon: "battery-low.png", stay: true, theme: "notification.Pop"}</pre>
 * <pre>{title: "Sync", message: "Your data have been synced", icon: "sync.png", theme: "notification.MessageBar"}</pre>
 * <pre>{title: "Sound", message: "The music is muted", icon: "sound-mute.png"}</pre>
 * @name enyo.Notification
 * @class
 * @author MacFJA
 * @version 1.2 (27/09/2013)
 */
enyo.kind({
	name: "enyo.Notification",
	kind: "enyo.Control",

	published: {
		/** @lends enyo.Notification# */
		/**
		 * The default notification theme (use getter/setter)
		 * @field
		 * @type String
		 * @default "notification.Bezel"
		 */
		defaultTheme: "notification.Bezel",
	},

	events: {
		/** @lends enyo.Notification# */
		/**
		 * Inform that a notification has been send
		 * @event
		 * @param {Object} inSender Event's sender
		 * @param {Object} inEvent The notification
		 * @see enyojs.com for more information about events
		 */
		onNotify: "",

		/**
		 * Inform that the notification is tap
		 * @event
		 * @param {Object} inSender Event's sender
		 * @param {Object} inEvent The notification
		 * @see enyojs.com for more information about events
		 */
		onTap: ""
	},
	/** @lends enyo.Notification# */

	/**
	 * The list of waiting notification
	 * @field
	 * @type Array
	 * @private
	 * @default <tt>[]</tt>
	 * @name enyo.Notification#pending
	 */
	pending: [],

	/**
	 * The list of loaded theme
	 * @field
	 * @type Array
	 * @private
	 * @default <tt>[]</tt>
	 * @name enyo.Notification#themes
	 */
	themes: [],

	/**
	 * The last unique identifier
	 * @field
	 * @type Number
	 * @private
	 * @default 0
	 * @name enyo.Notification#uid
	 */
	uid: 0,

	/**
	 * Send a new notification
	 * @function
	 * @name enyo.Notification#sendNotification
	 * @param {Object} notification The notification to send
	 * @param {Function} [callback] The callBack function
	 * @return The notification UID
	 */
	sendNotification: function(notification, callback) {
		//Get the theme (or defaultTheme if no theme specified)
		var theme = this.getTheme(notification.theme||this.defaultTheme);

		this.pending.push({
			theme: theme,
			uid: this.uid,
			notification: notification,
			callback: (typeof(callback) != "function")?enyo.nop:callback,//if no callback function, use enyo.nop
		});

		theme.newNotification(notification, this.uid);//Send the notification
		this.doNotify(notification);//Send a event to inform about this new notification
		this.uid++;//Increment uid of notification

		return this.uid-1;
	},

	/**
	 * Return the theme with a specific name
	 * @function
	 * @private
	 * @param {String} name The name of the theme
	 * @returns The theme
	 * @type Object
	 * @name enyo.Notification#getTheme
	 */
	getTheme: function(name) {
		//Search the theme
		for(var tour=0,size=this.themes.length;tour<size;tour++) {
			if(this.themes[tour].name == name) {
				return this.themes[tour].component;//Return the component
			}
		}
		//If here, the theme doesn't exist, so create it.
		var newNode = this.createComponent({kind: name, onTap: "notifTap", onClose: "notifClose"}, {owner: this});
		this.themes.push({name: name, component: newNode});
		return this.themes[this.themes.length-1].component;//Return the new theme
	},

	/**
	 * Handler for <q>onTap</q> event
	 * @function
	 * @name enyo.Notification#notifTap
	 * @private
	 */
	notifTap: function(inSender, inEvent) {
		//Search the notification by its uid
		for(var tour=0,size=this.pending.length;tour<size;tour++) {
			if((this.pending[tour]) && this.pending[tour].uid == inEvent.uid) {
				this.pending[tour].callback(this.pending[tour].notification);//call the callback function
				this.doTap(this.pending[tour].notification);//Send a onTap event
				enyo.remove(this.pending[tour], this.pending);//Remove the pending notification
        return true;//End the function
			}
		}
	},

	/**
	 * Handler for <q>onClose</q> event
	 * @function
	 * @name enyo.Notification#notifClose
	 * @private
	 */
	notifClose: function(inSender, inEvent) {
		//Search the notification by its uid
		for(var tour=0,size=this.pending.length;tour<size;tour++) {
			if(this.pending[tour].uid == inEvent.uid) {
				enyo.remove(this.pending[tour], this.pending);//Remove the pending notification
				return;//Exit the function
			}
		}
	},

	/**
	 * Remove all pending noification
	 * @function
	 * @name enyo.Notification#removeAlls
	 * @param {Boolean} onlyStay Indicate if only <tt>stau</tt> notification sould be removed
	 */
	removeAllNotifications: function(onlyStay) {
		for(var tour=this.pending.length-1;tour>=0;tour--) {
			if(!onlyStay || onlyStay && this.pending[tour].notification.stay) {
				this.removeNotification(this.pending[tour].uid)
			}
		}
	},

	/**
	 * Remove a particular notification
	 * @function
	 * @name enyo.Notification#removeNotification
	 * @param {Int} uid The Uid of the notification
	 */
	removeNotification: function(uid) {
		//Search the notification by its uid
		for(var tour=0,size=this.pending.length;tour<size;tour++) {
			if(this.pending[tour].uid == uid) {
				this.pending[tour].theme.removeNotification(this.pending[tour].uid);
				enyo.remove(this.pending[tour], this.pending);//Remove the pending notification
				return;//Exit the function
			}
		}
	},

	/**
	 * Return an associative array of all pending notification<br />
	 * Key = Uid<br />
	 * Value = Notification<br />
	 * @function
	 * @name enyo.Notification.getPendingNotification
	 * @return Array of notification
	 */
	getPendingNotification: function() {
		var result = {};

		for(var tour=0,size=this.pending.length;tour<size;tour) {
			result[this.pending[tour].uid] = this.pending[tour].notification;
		}

		return result;
	}
});
