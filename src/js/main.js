
defiant.require("modules/call.js");


const ME = defiant.user.username;

const facetime = {
	els: {},
	init() {
		// fast references
		this.els = {
			content: window.find("content"),
			sidebar: window.find(".sidebar"),
			sidebarToggler: window.find(".sidebar-toggler"),
			callList: window.find(".call-list"),
			videoCall: window.find(".video-call"),
			videoMe: window.find(".me video"),
			videoOther: window.find(".other"),
		};

		// init auxilliary objects
		Call.init();

		window.bluePrint.selectNodes("//History/i").map(call => {
			let timestamp = defiant.moment(+call.getAttribute("stamp"));
			call.setAttribute("timestamp", timestamp.format("ddd D MMM, HH:mm"));
		});

		// auto click "all" tab
		window.find(".tab-row > div[data-arg='all']").trigger("click");

		// auto mute video elements
		this.els.content.find("video").map(el => { el.muted = true; });


		if (ME === "bill") {
			window.find(".call-list .call-entry[data-username='hbi'] [data-click='start-camera-call']").trigger("click");
		}
	},
	dispatch(event) {
		let Self = facetime,
			user,
			type,
			isOn,
			el;
		switch (event.type) {
			// system events
			case "window.open":
				return;
				navigator.mediaDevices
					.getUserMedia({ video: true, audio: true })
					.then(stream => {
						let video = Self.els.videoMe[0];
						
						Self.stream = stream;

						video.srcObject = stream;
						// video.muted = true;
						video.addEventListener("loadedmetadata", () => {
							video.play();
						});
					});
				break;
			case "net.receive":
				// forward event to Call-object
				Call.receive(event);
				break;
			case "window.close":
				if (Self.stream) {
					Self.els.videoMe[0].src = "";
					Self.stream.getTracks().map(item => item.stop());
				}
				break;
			// custom events
			case "toggle-sidebar":
				if (event.value === "show") isOn = false;
				isOn = isOn || Self.els.sidebarToggler.hasClass("push-in");
				Self.els.sidebarToggler.toggleClass("push-in", isOn);
				Self.els.sidebar.toggleClass("open", isOn);
				break;
			case "select-tab":
				el = event.el;
				if (el.hasClass("tab-active")) return;

				el.parent().find(".tab-active").removeClass("tab-active");
				el.addClass("tab-active");
				
				// render channels
				switch (el.data("arg")) {
					case "all":
						window.render({
							template: "calls",
							match: "//Data/History",
							loopPath: "/xsl:for-each",
							loopSelect: "./*",
							target: Self.els.callList
						});
						break;
					case "missed":
						window.render({
							template: "calls",
							match: "//Data/History",
							loopPath: "/xsl:for-each",
							loopSelect: "./*[@duration = '0']",
							target: Self.els.callList
						});
						break;
					case "friends":
						window.render({
							template: "friends",
							match: "sys://Settings/Friends",
							target: Self.els.callList
						});
						break;
				}
				break;
			// call related events
			case "toggle-camera":
				el = event.el.find("i");
				isOn = el.hasClass("icon-camera");
				
				if (isOn) {
					el.prop({ className: "icon-camera-off" });
				} else {
					el.prop({ className: "icon-camera" });
				}
				// camera mute status
				Self.els.videoMe[0][ ! isOn ? "play" : "pause" ]();
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
				Self.els.videoMe[0].muted = ! isOn;
				break;
			case "accept-call":
				// send call request
				window.net.send({
					action: "accept",
					from: ME,
					to: Self.els.videoCall.data("username"),
				});
				break;
			case "decline-call":
				// send call request
				window.net.send({
					action: "decline",
					from: ME,
					to: Self.els.videoCall.data("username"),
				});
				break;
			case "end-call":
				// send call request
				window.net.send({
					action: "hang-up",
					from: ME,
					to: Self.els.videoCall.data("username"),
				});
				break;
			case "start-camera-call":
			case "start-voice-call":
				el = event.el;
				if (!el.data("username")) el = el.parents("[data-username]");

				type = event.type.split("-")[1]
				user = defiant.user.friend(el.data("username"));

				// send call request
				window.net.send({
					action: "inititate",
					from: ME,
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
	}
};

window.exports = facetime;
