
@import "./modules/test.js"


let Pref = {
		"clear-history-log": 604800,  // Seven days: 7*24*60*60
		"sidebar": {
			"expanded": false,
			"active-tab": 0,
		},
	};


const bell = {
	init() {
		// get settings, if any
		// this.settings = window.settings.getItem("settings") || { ...Pref };
		this.settings = { ...Pref };

		// init all sub-objects
		Object.keys(this)
			.filter(i => typeof this[i].init === "function")
			.map(i => this[i].init());

		// DEV-ONLY-START
		Test.init(this);
		// DEV-ONLY-END
	},
	dispatch(event) {
		let Self = bell,
			name,
			value,
			pEl,
			el;
		switch (event.type) {
			// system events
			case "window.init":
				return;
				// initiate camera
				navigator.mediaDevices
					.getUserMedia({ video: true, audio: true })
					.then(stream => {
						let video = Self.sidebar.els.videoMe[0];
						// save reference to stream
						Self.stream = stream;

						video.srcObject = stream;
						video.muted = karaqu.env === "dev";
						video.addEventListener("loadedmetadata", () => video.play());
					});
				break;
			case "window.close":
				// disconnect camera stream
				if (Self.stream) {
					Self.els.videoMe[0].src = "";
					Self.stream.getTracks().map(item => item.stop());
				}
				// save settings
				window.settings.setItem("settings", Self.settings);
				break;
			// custom events
			case "toggle-sidebar":
				return Self.sidebar.dispatch(event);
			default:
				el = event.el;
				if (event.origin) el = event.origin.el;
				if (!el && event.target) el = $(event.target);
				if (el) {
					pEl = el.data("area") ? el : el.parents("[data-area]");
					if (pEl.length) {
						name = pEl.data("area");
						return Self[name].dispatch(event);
					}
				}
		}
	},
	sidebar: @import "./modules/sidebar.js",
	history: @import "./modules/history.js",
	call: @import "./modules/call.js",
};

window.exports = bell;
