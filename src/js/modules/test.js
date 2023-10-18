
let Test = {
	init(APP) {
		
		// return;

		if (ME.username === "bill") {
			let selector = `.friend[data-username="hbi"] div[data-click="start-camera-call"]`;
			setTimeout(() => APP.sidebar.els.sidebar.find(selector).trigger("click"), 1e3);
		}

		// setTimeout(() => APP.call.dispatch({
		// 	type: "inbound-voice-request", from: "bill",
		// 	// type: "outbound-voice-request", to: "steve",
		// }), 1e3);

		// setTimeout(() => {
		// 	APP.sidebar.els.input.val("s");
		// 	APP.sidebar.dispatch({ type: "window.keyup" });
		// }, 1e3);


		// setTimeout(() => APP.sidebar.dispatch({
		// 	type: "friend-status",
		// 	detail: { username: "bill", status: 1 }
		// }), 5e2);

	}
};
