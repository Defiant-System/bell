
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
		// console.log(event);
		switch (event.type) {
			// system events
			case "window.init":
				Self.call.dispatch({ type: "init-camera" });
				break;
			case "window.close":
				Self.call.dispatch({ type: "kill-camera" });
				// save settings
				window.settings.setItem("settings", Self.settings);
				break;
			// custom events
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
