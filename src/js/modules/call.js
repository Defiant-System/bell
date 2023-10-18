
// bell.call

{
	init() {
		// fast references
		this.els = {
			sidebar: window.find(".sidebar"),
			sidebarToggler: window.find(".sidebar-toggler"),
			callTitle: window.find("h2.call-title"),
			videoCall: window.find(".video-call"),
			videoMe: window.find(".me video"),
			videoOther: window.find(".other"),
		};
		// default
		this.isCameraOff = false;
		this.isMute = false;
	},
	dispatch(event) {
		let APP = bell,
			Self = APP.call,
			action,
			data,
			user,
			type,
			from,
			isOn,
			to,
			el;
		// console.log(event);
		switch (event.type) {
			case "init-camera":
				// initiate camera
				navigator.mediaDevices
					.getUserMedia({ video: true, audio: true })
					.then(stream => {
						let video = Self.els.videoMe[0];
						// save reference to stream
						Self.stream = stream;

						video.srcObject = stream;
						video.muted = karaqu.env === "dev";
						video.addEventListener("loadedmetadata", () => video.play());
					});
				break;
			case "kill-camera":
				// disconnect camera stream
				if (Self.stream) {
					Self.els.videoMe[0].src = "";
					Self.stream.getTracks().map(item => item.stop());
				}
				break;
			// custom events
			case "toggle-sidebar":
				if (event.value) isOn = event.value === "hide";
				else isOn = event.el.hasClass("push-in");
				Self.els.sidebarToggler.toggleClass("push-in", isOn);
				Self.els.sidebar.toggleClass("open", isOn);
				break;
			case "toggle-camera":
				event.el.find("> i").toggleClass("icon-camera-off", Self.isCameraOff);
				Self.isCameraOff = !Self.isCameraOff;
				break;
			case "toggle-microphone":
				event.el.find("> i").toggleClass("icon-mic-mute", Self.isMute);
				Self.isMute = !Self.isMute;
				break;
			// UI updates
			case "inbound-voice-request":
				user = karaqu.user.friend(event.from);
				Self.els.videoCall.data({ "username": user.username });
				Self.els.callTitle.find(".verb").html(karaqu.i18n("is calling"));
				Self.els.callTitle.find(".user").html(user.name);
				Self.els.videoCall.addClass("inbound-voice-request");
				Self.dispatch({ type: "toggle-sidebar", value: "hide" });
				break;
			case "inbound-camera-request":
				user = karaqu.user.friend(event.from);
				Self.els.videoCall.data({ "username": user.username });
				Self.els.callTitle.find(".verb").html(karaqu.i18n("is calling"));
				Self.els.callTitle.find(".user").html(user.name);
				Self.els.videoCall.addClass("inbound-camera-request");
				Self.dispatch({ type: "toggle-sidebar", value: "hide" });
				break;
			case "outbound-voice-request":
				user = karaqu.user.friend(event.to);
				Self.els.videoCall.data({ "username": user.username });
				Self.els.callTitle.find(".verb").html(karaqu.i18n("Calling"));
				Self.els.callTitle.find(".user").html(user.name);
				Self.els.videoCall.addClass("outbound-voice-request");
				Self.dispatch({ type: "toggle-sidebar", value: "hide" });
				break;
			case "outbound-camera-request":
				user = karaqu.user.friend(event.to);
				Self.els.videoCall.data({ "username": user.username });
				Self.els.callTitle.find(".verb").html(karaqu.i18n("Calling"));
				Self.els.callTitle.find(".user").html(user.name);
				Self.els.videoCall.addClass("outbound-camera-request");
				Self.dispatch({ type: "toggle-sidebar", value: "hide" });

				// send call request
				Self.activeMessageId = window.net.send({
					action: "initiate",
					from: ME.username,
					fromName: ME.name,
					to: user.username,
					nolog: true,
					channel: `camera:${window.peer.id}`,
					message: `<b>${ME.name}</b> is calling you.`,
					options: [
						{
							id: karaqu.AFFIRMATIVE,
							name: "Accept",
							payload: "action,channel",
						},
						{
							id: karaqu.NEGATIVE,
							name: "Decline",
							payload: "action,channel",
						}
					],
				});
				break;
			
			// call related
			case "accept-call":
				[action, type] = event.type.split("-");
				user = karaqu.user.friend(Self.els.videoCall.data("username"));
				// adapt screen based up on call type
				Self.els.videoCall.prop({ className: `video-call ongoing-${Self.data.type}-call` });

				// send response to call request
				window.net.send({
					action,
					from: ME.username,
					fromName: ME.name,
					to: Self.els.videoCall.data("username"),
				});
				break;
			case "end-call":
				// call was answered - add time stamp and calculate duration
				data = { ...Self.data };
				data.duration = Math.round((Date.now() - Self.data.stamp) / 1000);

				APP.sidebar.dispatch({ type: "log-call", data });
				// adapt screen based up on call type
				Self.els.videoCall.prop({ className: "video-call" });
				Self.dispatch({ type: "toggle-sidebar", value: "show" });

				// send response to call request
				window.net.send({
					action: "hang-up",
					from: ME.username,
					fromName: ME.name,
					to: Self.els.videoCall.data("username"),
				});
				break;
			case "decline-call":
				[action, type] = event.type.split("-");
				// call was not answered - add time stamp
				data = { ...Self.data };
				data.duration = Math.round((Date.now() - Self.data.stamp) / 1000);

				APP.sidebar.dispatch({ type: "log-call", data });
				// adapt screen based up on call type
				Self.els.videoCall.prop({ className: "video-call" });
				Self.dispatch({ type: "toggle-sidebar", value: "show" });

				// send response to call request
				window.net.send({
					action,
					from: ME.username,
					fromName: ME.name,
					to: Self.els.videoCall.data("username"),
					message: `<b>${ME.name}</b> tried calling you.`,
					forget: Self.activeMessageId,
				});
				break;
		}
	},
	receive(event) {
		let APP = bell,
			Self = APP.call,
			action,
			data,
			user,
			type,
			id,
			from,
			to,
			el;
		// console.log(event);
		switch (event.action) {
			case "initiate":
				[type, id] = event.channel.split(":");

				// reference data for active call
				Self.data = {
					type,
					user1: event.from,
					user2: event.to,
					channel: event.channel,
					stamp: Date.now(),
				};

				// adapt screen based up on call type
				if (event.from === ME.username) {
					user = karaqu.user.friend(event.to);
					Self.els.videoCall.data({ "username": user.username });
					Self.els.callTitle.find(".verb").html( karaqu.i18n("Calling") );
					Self.els.callTitle.find(".user").html( user.name );
					Self.dispatch({ type: "toggle-sidebar", value: "hide" });
					Self.els.videoCall.addClass(`outbound-${type}-request`);
				} else {
					if (!Self.stream) {
						// if camera stream has not yet finish initiate - wait & try again
						return setTimeout(() => Self.receive(event), 500);
					}
					user = karaqu.user.friend(event.from);
					Self.els.videoCall.data({ "username": user.username });
					Self.els.callTitle.find(".verb").html( karaqu.i18n("is calling") );
					Self.els.callTitle.find(".user").html( user.name );
					Self.dispatch({ type: "toggle-sidebar", value: "hide" });
					Self.els.videoCall.addClass(`inbound-${type}-request`);

					if (event.response !== undefined) {
						action = (event.response === karaqu.AFFIRMATIVE) ? "accept" : "decline";
						Self.dispatch({ ...event, action, type: action +"-call" });
					}
				}
				break;
			case "accept":
				user = karaqu.user.friend(Self.els.videoCall.data("username"));
				// call answered - add time stamp
				Self.data.stamp = Date.now();
				// adapt screen based up on call type
				Self.els.videoCall.prop({ className: `video-call ongoing-${Self.data.type}-call` });

				if (event.from === ME.username) {
					Self.peer.connect();
					user.uuid = Self.data.channel.split(":")[1];
					Self.peer.call(user, Self.stream);
				} else {
					Self.peer.connect();
				}
				break;
			case "hang-up":
				// reset screen
				Self.els.videoCall.prop({ className: "video-call" });
				Self.dispatch({ type: "toggle-sidebar", value: "show" });
				break;
			case "decline":
				// reset screen
				Self.els.videoCall.prop({ className: "video-call" });
				Self.dispatch({ type: "toggle-sidebar", value: "show" });
				break;
			// this is response via "notification"
			case "response":
				if (event.response === false) {
					Self.receive({ action: "decline" });
				}
				break;
		}
	},
	peer: {
		connect() {
			let Self = bell.call;
			// establish connection
			Self.connection = window.peer.connect({
				// on events
				call: this.receiveCall.bind(this)
			});
			//Call.connection.on("call", this.receiveCall.bind(this));
		},
		call(user, stream) {
			let Self = bell.call;
			Self.mediaConnection = Self.connection.call(user.uuid, stream);

			Self.mediaConnection.on("stream", this.receiveStream.bind(this));
			Self.mediaConnection.on("close", this.disconnect.bind(this));
		},
		receiveCall(mediaConnection) {
			let Self = bell.call;
			Self.mediaConnection = mediaConnection;

			mediaConnection.answer(Self.stream);
			mediaConnection.on("stream", this.receiveStream.bind(this));
		},
		receiveStream(userStream) {
			let Self = bell.call,
				videoEl = Self.els.videoOther.find("video")[0];

			videoEl.srcObject = userStream;
			videoEl.addEventListener("loadedmetadata", () => videoEl.play());
		},
		disconnect() {
			let Self = bell.call;

			if (Self.mediaConnection) {
				Self.mediaConnection.close();
			}

			//delete bell.els.videoOther.find("video").srcObject;
			Self.els.videoOther.html("<video></video>");
		}
	}
}
