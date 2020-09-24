
const Call = {
	init() {
		this.els = {
			callTitle: window.find("h2.call-title"),
		}
	},
	peer: {
		connect() {
			// establish connection
			Call.connection = window.peer.connect({
				// on events
				call: this.receiveCall.bind(this)
			});
			
			//Call.connection.on("call", this.receiveCall.bind(this));
		},
		call(user, stream) {
			Call.mediaConnection = Call.connection.call(user.uuid, stream);

			Call.mediaConnection.on("stream", this.receiveStream.bind(this));
			Call.mediaConnection.on("close", this.disconnect.bind(this));
		},
		receiveCall(mediaConnection) {
			Call.mediaConnection = mediaConnection;

			mediaConnection.answer(facetime.stream);
			mediaConnection.on("stream", this.receiveStream.bind(this));
		},
		receiveStream(userStream) {
			let videoEl = facetime.els.videoOther.find("video")[0];

			videoEl.srcObject = userStream;
			videoEl.addEventListener("loadedmetadata", () => videoEl.play());
		},
		disconnect() {
			Call.mediaConnection.close();

			//delete facetime.els.videoOther.find("video").srcObject;
			facetime.els.videoOther.html("<video></video>");
		}
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
		//console.log(event);
		switch (event.action) {
			case "inititate":
				type = event.channel.split(":")[0];

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
					Self.els.callTitle.find(".verb").html( defiant.i18n("Calling") );
					Self.els.callTitle.find(".user").html( user.name );
					APP.dispatch({ type: "toggle-sidebar", value: "hide" });
					APP.els.videoCall.addClass(`outbound-${type}-request`);
				} else {
					user = defiant.user.friend(event.from);
					Self.el.data({ "username": user.username });
					Self.els.callTitle.find(".verb").html( defiant.i18n("is calling") );
					Self.els.callTitle.find(".user").html( user.name );
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
				// adapt screen based up on call type
				Self.el.prop({ className: "video-call" });
				APP.dispatch({ type: "toggle-sidebar", value: "show" });

				if (event.from === ME) {
					console.log(`I, ${ME}, ${event.action} call`);

					Self.peer.disconnect();
				} else {
					user = defiant.user.friend(Self.el.data("username"));
					console.log(`${user.name}, ${event.action} call`);

					Self.peer.disconnect();
				}
				// TODO: add entry to call log
				break;
			case "accept":
				user = defiant.user.friend(Self.el.data("username"));

				// adapt screen based up on call type
				Self.el.prop({ className: `video-call ongoing-${Self.data.type}-call` });

				if (event.from === ME) {
					//console.log(`I, ${ME}, ${event.action} call`);
					Self.peer.connect();

					user.uuid = Self.data.channel.split(":")[1];
					Self.peer.call(user, APP.stream);
				} else {
					//console.log(`${user.name}, ${event.action} call`);

					Self.peer.connect();
				}
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
