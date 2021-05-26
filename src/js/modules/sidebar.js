
const Sidebar = {
	init() {
		// listen to system event
		defiant.on("sys:friend-status", this.dispatch);
	},
	dispatch(event) {
		let APP = edison,
			Self = Sidebar,
			target,
			user,
			value,
			isOn,
			el;
		switch (event.type) {
			// system events
			case "friend-status":
				user = event.detail.username;
				value = event.detail.online === "1" ? "online" : "offline";
				el = APP.els.callList.find(`div[data-username="${user}"]`);
				// update user status
				el.removeClass("online offline").addClass(value);
				break;
			// custom events
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
