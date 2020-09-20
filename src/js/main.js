
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
			meVideo: window.find(".me video"),
			meOther: window.find(".other video"),
		};

		window.bluePrint.selectNodes("//History/i").map(call => {
			let timestamp = defiant.moment(+call.getAttribute("stamp"));
			call.setAttribute("timestamp", timestamp.format("ddd D MMM, HH:mm"));
		});

		// temp
		window.find(".tab-row > div[data-arg='friends']").trigger("click");
	},
	dispatch(event) {
		let Self = facetime,
			isOn,
			el;
		switch (event.type) {
			// system events
			case "window.open":
				return;
				navigator.mediaDevices.getUserMedia({
						video: true,
						audio: true
					}).then(stream => {
						let video = Self.els.meVideo[0];
						
						Self.stream = stream;

						video.srcObject = stream;
						video.muted = true;
						video.addEventListener("loadedmetadata", () => {
							video.play();
						});
					});
				break;
			case "window.close":
				if (Self.stream) {
					Self.els.meVideo[0].src = "";
					Self.stream.getTracks().map(item => item.stop());
				}
				break;
			// custom events
			case "toggle-camera":
				el = event.el.find("i");
				isOn = el.hasClass("icon-camera");
				
				if (isOn) {
					el.prop({ className: "icon-camera-off" });
				} else {
					el.prop({ className: "icon-camera" });
				}
				break;
			case "toggle-microphone":
				el = event.el.find("i");
				isOn = el.hasClass("icon-mic-on");
				
				if (isOn) {
					el.prop({ className: "icon-mic-mute" });
				} else {
					el.prop({ className: "icon-mic-on" });
				}
				break;
			case "end-call":
				Self.els.videoCall.removeClass("ongoing");
				Self.dispatch({ type: "toggle-sidebar", value: "show" });
				break;
			case "toggle-sidebar":
				if (event.value === "show") isOn = false;
				isOn = isOn || Self.els.sidebarToggler.hasClass("push-in");
				Self.els.sidebarToggler.toggleClass("push-in", isOn);
				Self.els.sidebar.toggleClass("open", isOn);
				break;
			case "get-call-info":
				break;
			case "start-camera-call":
			case "start-voice-call":
				Self.dispatch({ type: "toggle-sidebar", value: "hide" });
				Self.els.videoCall.addClass("ongoing");
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
		}
	}
};

window.exports = facetime;
