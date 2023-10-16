
let Test = {
	init(APP) {
		// return;

		setTimeout(() => APP.call.dispatch({
			// type: "inbound-voice-request", from: "bill",
			type: "outbound-voice-request", to: "steve",
		}), 1e3);


		// setTimeout(() => APP.sidebar.dispatch({
		// 	type: "friend-status",
		// 	detail: { username: "bill", status: 1 }
		// }), 1e3);

	}
};
