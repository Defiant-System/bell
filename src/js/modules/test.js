
let Test = {
	init(APP) {
		
		setTimeout(() => APP.sidebar.dispatch({
			type: "friend-status",
			detail: { username: "bill", status: 1 }
		}), 1e3);

	}
};
