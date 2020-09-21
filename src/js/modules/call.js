
const Call = {
	init() {

	},
	receive(event) {
		let APP = facetime,
			Self = Call,
			action,
			user,
			type,
			from,
			to,
			el;
		console.log(event);
		switch (event.action) {
			case "inititate":
				type = event.channel.split("-")[0];

				// fast reference for the rest of the call
				Self.el = window.find(".video-call");
				// reference data for active call
				Self.data = {
					type,
					user1: event.from,
					user2: event.to,
					channel: event.channel,
				};

				// adapt screen based up on call type
				if (event.from === ME) {
					user = defiant.user.friend(event.to);
					Self.el.data({ "username": user.username });
					Self.el.find(".other h2 .user").html(user.name);
					APP.dispatch({ type: "toggle-sidebar", value: "hide" });
					APP.els.videoCall.addClass(`outbound-${type}-request`);
				} else {
					user = defiant.user.friend(event.from);
					Self.el.data({ "username": user.username });
					Self.el.find(".other h2 .user").html(user.name);
					APP.dispatch({ type: "toggle-sidebar", value: "hide" });
					APP.els.videoCall.addClass(`inbound-${type}-request`);

					if (event.response !== undefined) {
						action = (event.response === defiant.AFFIRMATIVE) ? "accept" : "decline";
						APP.dispatch({ ...event, action, type: action +"-call" });
					}
				}
				break;
			case "hang-up":
			case "decline":
				if (event.from === ME) {
					console.log(`I, ${ME}, ${event.action} call`);
				} else {
					user = defiant.user.friend(Self.el.data("username"));
					console.log(`${user.name}, ${event.action} call`);
				}
				// adapt screen based up on call type
				Self.el.prop({ className: "video-call" });
				APP.dispatch({ type: "toggle-sidebar", value: "show" });
				// TODO: add entry to call log
				break;
			case "accept":
				if (event.from === ME) {
					console.log(`I, ${ME}, ${event.action} call`);
				} else {
					user = defiant.user.friend(Self.el.data("username"));
					console.log(`${user.name}, ${event.action} call`);
				}
				// adapt screen based up on call type
				Self.el.prop({ className: `video-call ongoing-${Self.data.type}-call` });
				// TODO: add entry to call log
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
