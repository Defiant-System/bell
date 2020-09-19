
const facetime = {
	init() {
		// fast references
		this.content = window.find("content");
		this.callList = window.find(".call-list");
		this.video = window.find("video");

		window.bluePrint.selectNodes("//History/i").map(call => {
			let timestamp = defiant.moment(+call.getAttribute("stamp"));
			call.setAttribute("timestamp", timestamp.format("ddd D MMM, HH:mm"));
		});

		// temp
		window.find(".tab-row > div[data-arg='all']").trigger("click");
	},
	dispatch(event) {
		let Self = facetime,
			el;
		switch (event.type) {
			// system events
			case "window.open":
				return;
				navigator.mediaDevices.getUserMedia({
						video: true,
						audio: true
					}).then(stream => {
						let video = Self.video[0];
						
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
					Self.video[0].src = "";
					Self.stream.getTracks().map(item => item.stop());
				}
				break;
			// custom events
			case "get-call-info":
			case "start-camera-call":
			case "start-voice-call":
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
							target: Self.callList
						});
						break;
					case "missed":
						window.render({
							template: "calls",
							match: "//Data/History",
							loopPath: "/xsl:for-each",
							loopSelect: "./*[@duration = '0']",
							target: Self.callList
						});
						break;
					case "friends":
						window.render({
							template: "friends",
							match: "sys://Settings/Friends",
							target: Self.callList
						});
						break;
				}
				break;
		}
	}
};

window.exports = facetime;
