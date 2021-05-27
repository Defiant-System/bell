
const Sidebar = {
	init() {
		// listen to system event
		defiant.on("sys:friend-status", this.dispatch);
	},
	dispatch(event) {
		let APP = edison,
			Self = Sidebar,
			data,
			xNode,
			target,
			user,
			inbound,
			value,
			isOn,
			str,
			pEl,
			el;
		switch (event.type) {
			// system events
			case "friend-status":
				user = event.detail.username;
				value = event.detail.status === 1 ? "online" : "offline";
				el = APP.els.callList.find(`div[data-username="${user}"]`);
				// update user status
				el.removeClass("online offline").addClass(value);
				break;
			// custom events
			case "start-camera-call":
			case "start-voice-call":
				Call.dispatch(event);
				break;
			case "history-log-call":
				user = ME.username === event.data.user1 ? event.data.user2 : event.data.user1;
				inbound = ME.username === event.data.user2 ? 1 : 0;
				str = `<i username="${user}"
							inbound="${inbound}"
							type="${event.data.type}"
							stamp="${event.data.stamp}"
							duration="${event.data.duration}" />`;
				// add entry to call log
				xNode = APP.xHistory.appendChild($.nodeFromString(str));

				// translate time stamps
				APP.fixTimestamp();

				// add entry to DOM
				el = window.render({
							template: "call-entry",
							match: `//Data/History/*[last()]`,
							vdom: true,
						})
						.find(".call-entry")
						.addClass("anim-entry-prepend");

				pEl = APP.els.callList;
				if (pEl.hasClass("list-all")) {
					el = pEl.prepend(el);
					// animate call entry
					setTimeout(() => {
						el.cssSequence("entry-reveal", "transitionend", el =>
							el.removeClass("anim-entry-prepend entry-reveal"));
					}, 100);
				}
				if (pEl.hasClass("list-missed")) {
					// add entry to missed calls list
				}
				break;
			case "toggle-sidebar":
				if (event.value === "show") isOn = false;
				isOn = isOn || APP.els.sidebarToggler.hasClass("push-in");
				APP.els.sidebarToggler.toggleClass("push-in", isOn);
				APP.els.sidebar.toggleClass("open", isOn);
				break;
			case "select-tab":
				el = event.el;
				value = el.data("arg");
				if (el.hasClass("tab-active")) return;

				el.parent().find(".tab-active").removeClass("tab-active");
				el.addClass("tab-active");

				target = APP.els.callList.removeClass("list-all list-missed list-friends");
				target.addClass(`list-${value}`);
				
				// render channels
				switch (value) {
					case "all":
						window.render({
							template: "calls",
							match: "//Data/History",
							changePath: "/xsl:for-each",
							changeSelect: "./*",
							target
						});
						break;
					case "missed":
						window.render({
							template: "calls",
							match: "//Data/History",
							changePath: "/xsl:for-each",
							changeSelect: "./*[@duration = '0']",
							target
						});
						break;
					case "friends":
						window.render({
							template: "friends",
							match: "sys://Settings/Friends",
							target
						});
						break;
				}
				break;
		}
	}
};
