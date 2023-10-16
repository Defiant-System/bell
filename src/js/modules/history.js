
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
			xNode,
			isMe,
			timestamp,
			username,
			inbound,
			str,
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
			case "log-call":
				isMe = ME.username === event.data.user1;
				username = isMe ? event.data.user2 : event.data.user1;
				inbound = ME.username === event.data.user2 ? 1 : 0;
				timestamp = new karaqu.Moment(+event.data.stamp);
				str = `<i username="${username}"
							inbound="${inbound}"
							type="${event.data.type}"
							stamp="${event.data.stamp}"
							timestamp="${timestamp.format("ddd D MMM, HH:mm")}"
							duration="${event.data.duration}"
							_new="1"/>`;
				// add entry to call log
				xNode = Self.xData.insertBefore($.nodeFromString(str), Self.xData.firstChild);
				return xNode;
		}
	}
}
