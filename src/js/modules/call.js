
const Call = {
	init() {
		// fast references
		this.els = {
			callTitle: window.find("h2.call-title"),
		};

		// call data to be saved to history

		// sample: missed - inbound
		// this.currentCall = {
		// 	username: "bill",
		// 	type: "camera",
		// 	inbound: 0,
		// 	stamp: 1595306176929,
		// 	duration: 0,
		// };

		// sample: received - outbound
		// this.currentCall = {
		// 	username: "steve",
		// 	type: "voice",
		// 	inbound: 1,
		// 	stamp: 1595306176929,
		// 	duration: 132,
		// };
	},
	dispatch(event) {
		let APP = bell,
			Self = Call,
			user,
			type,
			isOn,
			el;
		switch (event.type) {
			case "toggle-camera":
				el = event.el.find("i");
				isOn = el.hasClass("icon-camera");
				
				if (isOn) {
					el.prop({ className: "icon-camera-off" });
				} else {
					el.prop({ className: "icon-camera" });
				}
				// camera mute status
				APP.els.videoMe[0][ ! isOn ? "play" : "pause" ]();
				break;
			case "toggle-microphone":
				el = event.el.find("i");
				isOn = el.hasClass("icon-mic-on");
				
				if (isOn) {
					el.prop({ className: "icon-mic-mute" });
				} else {
					el.prop({ className: "icon-mic-on" });
				}
				// microphone mute status
				APP.els.videoMe[0].muted = ! isOn;
				break;
			case "accept-call":
				// send call request
				window.net.send({
					action: "accept",
					from: ME.username,
					fromName: ME.name,
					to: APP.els.videoCall.data("username"),
				});
				break;
			case "decline-call":
				// send call request
				window.net.send({
					action: "decline",
					from: ME.username,
					fromName: ME.name,
					to: APP.els.videoCall.data("username"),
				});
				break;
			case "end-call":
				// send call request
				window.net.send({
					action: "hang-up",
					from: ME.username,
					fromName: ME.name,
					to: APP.els.videoCall.data("username"),
				});
				break;
			case "start-camera-call":
			case "start-voice-call":
				el = event.el;
				if (!el.data("username")) el = el.parents("[data-username]");
				event.username = el.data("username");
				/* falls through */
			case "return-camera-call":
			case "return-voice-call":
				type = event.type.split("-")[1];
				user = defiant.user.friend(event.username || event.to);

				// send call request
				window.net.send({
					action: "inititate",
					from: ME.username,
					fromName: ME.name,
					to: user.username,
					channel: `${type}:${window.peer.id}`,
					message: `<b>${user.name}</b> is calling you.`,
					options: [
						{
							id: defiant.AFFIRMATIVE,
							name: "Accept",
							payload: "action,channel",
						},
						{
							id: defiant.NEGATIVE,
							name: "Decline",
							payload: "action,channel",
						}
					]
				});
				break;
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

			mediaConnection.answer(bell.stream);
			mediaConnection.on("stream", this.receiveStream.bind(this));
		},
		receiveStream(userStream) {
			let videoEl = bell.els.videoOther.find("video")[0];

			videoEl.srcObject = userStream;
			videoEl.addEventListener("loadedmetadata", () => videoEl.play());
		},
		disconnect() {
			if (Call.mediaConnection) {
				Call.mediaConnection.close();
			}

			//delete bell.els.videoOther.find("video").srcObject;
			bell.els.videoOther.html("<video></video>");
		}
	},
	receive(event) {
		let APP = bell,
			Self = Call,
			action,
			data,
			user,
			type,
			from,
			to,
			el;
		//console.log(event);
		switch (event.action) {
			case "return-camera-call":
			case "return-voice-call":
				return APP.dispatch({ ...event, type: event.action });
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
				if (event.from === ME.username) {
					user = defiant.user.friend(event.to);
					Self.el.data({ "username": user.username });
					Self.els.callTitle.find(".verb").html( defiant.i18n("Calling") );
					Self.els.callTitle.find(".user").html( user.name );
					APP.dispatch({ type: "toggle-sidebar", value: "hide" });
					APP.els.videoCall.addClass(`outbound-${type}-request`);
				} else {
					if (!APP.stream) {
						// if camera stream has not yet finish initiate - wait & try again
						return setTimeout(() => Self.receive(event), 200);
					}
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

				if (event.from === ME.username) {
					console.log(`I, ${ME.username}, ${event.action} call`);

					Self.peer.disconnect();
				} else {
					user = defiant.user.friend(Self.el.data("username"));
					console.log(`${user.name}, ${event.action} call`);

					Self.peer.disconnect();
				}
				// add entry to call log
				data = { ...Self.data };
				if (data.stamp) {
					// call answered - add duration
					data.duration = Math.round((Date.now() - Self.data.stamp) / 1000);
				} else {
					// call was not answered - add time stamp and "0" as duration
					data.stamp = Date.now();
					data.duration = 0;
				}
				Sidebar.dispatch({ type: "history-log-call", data });
				break;
			case "accept":
				user = defiant.user.friend(Self.el.data("username"));

				// call answered - add time stamp
				Self.data.stamp = Date.now();

				// adapt screen based up on call type
				Self.el.prop({ className: `video-call ongoing-${Self.data.type}-call` });

				if (event.from === ME.username) {
					//console.log(`I, ${ME.username}, ${event.action} call`);
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
