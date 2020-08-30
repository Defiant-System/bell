
const facetime = {
	init() {
		// fast references
		this.content = window.find("content");
		this.video = window.find("video");
	},
	dispatch(event) {
		let Self = facetime,
			el;
		switch (event.type) {
			case "window.open":
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
				Self.video[0].src = "";
				Self.stream.getTracks().map(item => item.stop());
				break;
		}
	}
};

window.exports = facetime;
