
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
						let video = this.video[0];
						
						video.srcObject = stream;
						video.muted = true;
						video.addEventListener("loadedmetadata", () => {
							video.play();
						});
					});
				break;
		}
	}
};

window.exports = facetime;
