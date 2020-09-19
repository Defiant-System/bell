
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

		// render channels
		window.render({
			template: "calls",
			match: `//Data/History`,
			target: this.callList
		});
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
			case "select-tab":
				event.el.parent().find(".tab-active").removeClass("tab-active");
				event.el.addClass("tab-active");
				break;
		}
	}
};

window.exports = facetime;
