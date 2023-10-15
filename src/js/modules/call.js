
// bell.call

{
	init() {
		// fast references
		this.els = {
			callTitle: window.find("h2.call-title"),
		};
	},
	dispatch(event) {
		let APP = bell,
			Self = APP.call,
			el;
		// console.log(event);
		switch (event.type) {
			// custom events
			case "some-event":
				break;
		}
	}
}
