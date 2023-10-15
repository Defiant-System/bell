
// bell.history

{
	init() {
		let Self = this;
		// check storage for previously saved data
		window.storage.getItem("call-history")
			.then(xData => {
				// console.log( xData );
				/*
				let xRef = window.bluePrint.selectSingleNode("//History");
				xData.selectNodes(`.//*[@_new]`).map(x => x.removeAttribute("_new"));
				xRef.parentNode.replaceChild(xData, xRef);
				// save reference to data
				Self.xData = xData;
				*/
				Self.xData = window.bluePrint.selectSingleNode("//History");
				// apply user settings
				Self.dispatch({ type: "parse-history-data" });
			});
	},
	dispatch(event) {
		let APP = bell,
			Self = APP.history,
			el;
		// console.log(event);
		switch (event.type) {
			case "parse-history-data":
				// fix time stamps
				Self.xData.selectNodes("./i[not(@timestamp)]").map(call => {
					let timestamp = new karaqu.Moment(+call.getAttribute("stamp"));
					call.setAttribute("timestamp", timestamp.format("ddd D MMM, HH:mm"));
				});

				// apply user settings on sidebar
				APP.sidebar.dispatch({ type: "apply-settings" });
				break;
		}
	}
}
