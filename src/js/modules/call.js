
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

		// temp
		this.data = {
			type: "camera", // voice camera
			user1: "bill",
			user2: "hbi",
			channel: "123",
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
			isOn,
			to,
			el;
		// console.log(event);
		switch (event.type) {
			case "init-camera":
				return;
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
				break;
			
			// call related
			case "accept-call":
				user = karaqu.user.friend(Self.els.videoCall.data("username"));
				// adapt screen based up on call type
				Self.els.videoCall.prop({ className: `video-call ongoing-${Self.data.type}-call` });
				break;
			case "end-call":
				// call was answered - add time stamp and calculate duration
				data = {
					user1: "bill",
					user2: "hbi",
					type: "voice",
					stamp: Date.now(),
					duration: 143,
				};
				APP.sidebar.dispatch({ type: "log-call", data });
				// adapt screen based up on call type
				Self.els.videoCall.prop({ className: "video-call" });
				Self.dispatch({ type: "toggle-sidebar", value: "show" });
				break;
			case "decline-call":
				// call was not answered - add time stamp and "0" as duration
				data = {
					user1: "bill",
					user2: "hbi",
					type: "voice",
					stamp: Date.now(),
					duration: 0,
				};
				APP.sidebar.dispatch({ type: "log-call", data });
				// adapt screen based up on call type
				Self.els.videoCall.prop({ className: "video-call" });
				Self.dispatch({ type: "toggle-sidebar", value: "show" });
				break;

			case "receive-accept": break;
			case "receive-hang-up": break;
			case "receive-decline": break;
		}
	}
}
