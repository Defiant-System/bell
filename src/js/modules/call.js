
const Call = {
	init() {

	},
	receive(event) {
		let APP = facetime,
			Self = Call,
			user,
			type,
			from,
			to,
			el;
		switch (event.action) {
			case "inititate":
				type = event.channel.split("-")[0];

				// fast reference for the rest of the call
				Self.el = window.find(".video-call");
				// reference data for active call
				Self.data = {
					user1: event.from,
					user2: event.to,
					channel: event.channel,
				};

				if (event.from === ME) {
					// adapt screen based up on call type
					user = defiant.user.friend(event.to);
					Self.el.data({ "username": user.username });
					Self.el.find(".other h2 .user").html(user.name);
					APP.dispatch({ type: "toggle-sidebar", value: "hide" });
					APP.els.videoCall.addClass(`outbound-${type}-request`);
					return;
				}

				// adapt screen based up on call type
				user = defiant.user.friend(event.from);
				Self.el.data({ "username": user.username });
				Self.el.find(".other h2 .user").html(user.name);
				APP.dispatch({ type: "toggle-sidebar", value: "hide" });
				APP.els.videoCall.addClass(`inbound-${type}-request`);
				break;
			case "hang-up":
				Self.el.prop({ className: "video-call" });
				APP.dispatch({ type: "toggle-sidebar", value: "show" });
				break;
			case "dismiss":
				break;
			case "audio-on":
				break;
			case "audio-off":
				break;
			case "camera-on":
				break;
			case "camera-off":
				break;
		}
	}
};
