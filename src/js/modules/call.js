
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
		// used when camera is "off"
		this.dispatch({ type: "init-stream-canvas" });
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
			str,
			el;
		// console.log(event);
		switch (event.type) {
			case "init-camera":
				// return;
				// initiate camera
				navigator.mediaDevices
					.getUserMedia({ video: true, audio: true })
					.then(stream => {
						let video = Self.els.videoMe[0];
						
						// turn off audio - to prevent feedback
						stream.getAudioTracks().map(audioTrack => audioTrack.stop());

						// save reference to stream
						Self.stream = stream;
						Self.cameraTrack = stream.getVideoTracks()[0];
						
						// Self.stream = Self.blankStream;
						// Self.dispatch({ type: "render-stream-canvas" });
						// Self.dispatch({ type: "toggle-sidebar", value: "hide" });

						video.srcObject = Self.stream;
						video.addEventListener("loadedmetadata", () => video.play());
						if (karaqu.env === "dev") {
							Self.dispatch({ type: "toggle-microphone", value: "off" });
						}
					});
				break;
			case "kill-camera":
				// stop any ongoing calls or attempt of call
				if (Self.activeMessageId) {
					Self.dispatch({ type: "end-call" });
				}
				// disconnect camera stream
				if (Self.stream) {
					Self.els.videoMe[0].src = "";
					Self.stream.getTracks().map(item => item.stop());
				}
				break;
			case "init-stream-canvas":
				// this canvas is "placeholder" for when user turns of camera
				Self.cvs = document.createElement("canvas");
				Self.ctx = Self.cvs.getContext("2d", { willReadFrequently: true });
				Self.cvs.width = window.innerWidth;
				Self.cvs.height = window.innerHeight;

				Self.blankStream = Self.cvs.captureStream(1);
				Self.canvasTrack = Self.blankStream.getVideoTracks()[0];
				break;
			case "render-stream-canvas":
				if (!Self.userAvatar) {
					let img = new Image;
					img.onload = () => {
						Self.userAvatar = img;
						Self.dispatch({ type: "draw-user-avatar" });
					};
					img.src = `/res/avatar/${ME.username}.jpg`;
				} else {
					Self.dispatch({ type: "draw-user-avatar" });
				}
				break;
			case "draw-user-avatar":
				Self.ctx.fillStyle = "#369";
				Self.ctx.fillRect(0,0,1e3,1e3);
				Self.ctx.drawImage(Self.userAvatar,
					(window.innerWidth - Self.userAvatar.width) * .5,
					(window.innerHeight - Self.userAvatar.height) * .5);
				break;
			// custom events
			case "toggle-sidebar":
				if (event.value) isOn = event.value === "hide";
				else isOn = event.el.hasClass("push-in");
				Self.els.sidebarToggler.toggleClass("push-in", isOn);
				Self.els.sidebar.toggleClass("open", isOn);
				break;
			case "toggle-camera":
				Self.els.videoCall.find(".camera > i").toggleClass("icon-camera-off", Self.isCameraOff);
				Self.isCameraOff = !Self.isCameraOff;

				Self.dispatch({ type: "render-stream-canvas" });
				Self.mediaConnection.peerConnection.getSenders()[1]
					.replaceTrack(Self.isCameraOff ? Self.canvasTrack : Self.cameraTrack);
				break;
			case "toggle-microphone":
				isOn = event.value === "off" ? false : !Self.isMute;
				// audio on vide element
				Self.els.videoMe[0].muted = isOn;
				// ui update
				Self.els.videoCall.find(".microphone > i").toggleClass("icon-mic-mute", Self.isMute);
				Self.isMute = !Self.isMute;
				break;
			// UI updates
			case "outbound-voice-request":
			case "outbound-camera-request":
				user = karaqu.user.friend(event.to);
				// extract request type
				type = event.type.split("-")[1];
				// send call request
				Self.activeMessageId = window.net.send({
					action: "initiate",
					from: ME.username,
					fromName: ME.name,
					to: user.username,
					nolog: true,
					channel: `${type}:${window.peer.id}`,
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
					message: `<b>${ME.name}</b> tried calling you.`,
					forget: Self.activeMessageId,
				});

				// delete reference to call
				delete Self.activeMessageId;
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
					// outbound UI
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
					// inbound UI
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
				// disconnect p2p, if any
				Self.peer.disconnect();
				// reset screen
				Self.els.videoCall.prop({ className: "video-call" });
				Self.dispatch({ type: "toggle-sidebar", value: "show" });
				// delete reference to call
				delete Self.activeMessageId;
				break;
			case "decline":
				// disconnect p2p, if any
				Self.peer.disconnect();
				// reset screen
				Self.els.videoCall.prop({ className: "video-call" });
				Self.dispatch({ type: "toggle-sidebar", value: "show" });
				// delete reference to call
				delete Self.activeMessageId;
				break;
			// this is response via "notification"
			case "response":
				if (event.response === false) {
					Self.receive({ action: "decline" });
					// delete reference to call
					delete Self.activeMessageId;
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
			// Self.connection.on("call", this.receiveCall.bind(this));
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
			Self.mediaConnection.answer(Self.stream);
			Self.mediaConnection.on("stream", this.receiveStream.bind(this));
		},
		receiveStream(userStream) {
			let Self = bell.call,
				videoEl = Self.els.videoOther.find("video")[0];
			videoEl.srcObject = userStream;
			videoEl.addEventListener("loadedmetadata", () => videoEl.play());
		},
		disconnect() {
			let Self = bell.call;
			// disconnect mediaConnection, if any
			if (Self.mediaConnection) {
				Self.mediaConnection.close();
			}
			// disconnect connection, if any
			if (Self.connection) {
				Self.connection.disconnect();
			}
			//delete bell.els.videoOther.find("video").srcObject;
			Self.els.videoOther.html("<video></video>");
		}
	}
}
