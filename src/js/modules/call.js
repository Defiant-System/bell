
// bell.call

{
	init() {
		// fast references
		this.els = {
			callTitle: window.find("h2.call-title"),
			videoCall: window.find(".video-call"),
		};
	},
	dispatch(event) {
		let APP = bell,
			Self = APP.call,
			action,
			data,
			user,
			type,
			from,
			to,
			el;
		// console.log(event);
		switch (event.type) {
			// custom events
			case "inbound-voice-request":
				user = karaqu.user.friend(event.from);
				Self.els.videoCall.data({ "username": user.username });
				Self.els.callTitle.find(".verb").html(karaqu.i18n("is calling"));
				Self.els.callTitle.find(".user").html(user.name);
				Self.els.videoCall.addClass("inbound-voice-request");
				APP.dispatch({ type: "toggle-sidebar", value: "hide" });
				break;
			case "outbound-voice-request":
				user = karaqu.user.friend(event.to);
				Self.els.videoCall.data({ "username": user.username });
				Self.els.callTitle.find(".verb").html(karaqu.i18n("Calling"));
				Self.els.callTitle.find(".user").html(user.name);
				Self.els.videoCall.addClass("outbound-voice-request");
				APP.dispatch({ type: "toggle-sidebar", value: "hide" });
				break;
			case "accept-call": break;
			case "accept-call": break;
			case "decline-call": break;
			case "end-call": break;
			case "toggle-camera": break;
			case "toggle-microphone": break;
		}
	}
}
