//Here the only needed informations
//Note that the theme is generate only one time and it owned by a enyo.Component subclass (enyo.Notification)

//IMPORTANT: Notification theme must handle default value for "duration" and "stay" (properties of a notification)

enyo.kind({
	//use "notification" name space to avoid conflict
	name: "notification.*",

	//MUST have event "onTap" and "onClose"
	events: {
		onTap: "",//The notification have been tapped
		onClose: ""//The notification closed (without user action)
	},

	//The request method
	newNotification: function(notification, uid) {
		/*
			the "notification" object and the "uid"
			is send in "onClose" and "onTap" event :
			this.doTap({"notification": notification, "uid": uid});
		*/
	},
	
	removeNotification: function(uid) {
		/*
			The notification with the uid "uid" request the theme to
			close it.
		*/
	}
});