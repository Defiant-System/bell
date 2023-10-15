
const bell = {
	init() {
		// init all sub-objects
		Object.keys(this)
			.filter(i => typeof this[i].init === "function")
			.map(i => this[i].init());

	},
	dispatch(event) {
		let Self = bell,
			el;
		switch (event.type) {
			// system events
			case "window.init":
				break;
		}
	},
	call: @import "./modules/call.js",
	sidebar: @import "./modules/sidebar.js",
};

window.exports = bell;
