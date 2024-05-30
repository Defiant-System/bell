
@import "./modules/test.js"


let Pref = {
		"clear-history-log": 604800,  // Seven days: 7*24*60*60
		"sidebar": {
			"expanded": true,
			"active-tab": 2,
		},
	};

const ME = karaqu.user;

const bell = {
	init() {
		// get settings, if any
		this.settings = window.settings.getItem("settings") || Pref;

		// init all sub-objects
		Object.keys(this)
			.filter(i => typeof this[i].init === "function")
			.map(i => this[i].init());

		this.call.dispatch({ type: "init-camera" });

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
		// console.log(event);
		switch (event.type) {
			// system events
			case "window.init":
				break;
			case "window.close":
				Self.call.dispatch({ type: "kill-camera" });
				// update settings
				value = Self.sidebar.els.sidebar.hasClass("open");
				Self.settings.sidebar["expanded"] = value;
				// update settings
				value = Self.sidebar.els.sidebar.find(".tab-view .tab-active").index();
				Self.settings.sidebar["active-tab"] = value;
				// save settings
				window.settings.setItem("settings", Self.settings);
				break;
			// network events
			case "net.receive":
				// dispatch event to call-object
				return Self.call.receive(event);
			// custom events
			case "voice-call-user":
			case "camera-call-user":
				karaqu.shell(`user -i '${event.username}'`)
					.then(res => {
						setTimeout(() => {
							if (res.result.online) {
								let type = `outbound-${event.type.split("-")[0]}-request`;
								Self.call.dispatch({ type, to: event.username });
							} else {
								// notify failure due to "offline"?
							}
						}, 300);
					});
				break;
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
