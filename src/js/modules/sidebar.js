
// bell.sidebar

{
	init() {
		// fast references
		this.els = {
			content: window.find("content"),
			sidebar: window.find(".sidebar"),
			sidebarToggler: window.find(".sidebar-toggler > i"),
			callList: window.find(".call-list .list-wrapper"),
			videoCall: window.find(".video-call"),
			videoMe: window.find(".me video"),
			videoOther: window.find(".other"),
		};
		// apply user settings
		this.dispatch({ type: "apply-settings" });
		// listen to system event
		karaqu.on("sys:friend-status", this.dispatch);
	},
	dispatch(event) {
		let APP = bell,
			Self = APP.sidebar,
			data,
			xPath,
			xNode,
			target,
			prepend,
			user,
			value,
			isOn,
			str,
			pEl,
			el;
		// console.log(event);
		switch (event.type) {
			// system events
			case "friend-status":
				user = event.detail.username;
				value = event.detail.status === 1 ? "online" : "offline";
				el = Self.els.callList.find(`div[data-username="${user}"]`);
				// update user status
				el.removeClass("online offline").addClass(value);
				break;
			// custom events
			case "apply-settings":
				if (APP.settings.sidebar.expanded) {
					Self.els.sidebarToggler.trigger("click");
				}
				value = APP.settings.sidebar["active-tab"];
				Self.els.sidebar.find(`.tab-row > div:nth(${value})`).trigger("click");
				break;
			case "toggle-sidebar":
				if (event.value === "show") isOn = false;
				isOn = isOn || Self.els.sidebarToggler.hasClass("push-in");
				Self.els.sidebarToggler.toggleClass("push-in", isOn);

				if (isOn) {
					Self.els.sidebar.removeClass("open");
				} else {
					Self.els.sidebar.cssSequence("open", "transitionend", sEl => {
						el = Self.els.callList.find(".anim-entry-prepend");
						if (event.value !== "show" || !el.length) return;
						// animate call entry
						el.cssSequence("entry-reveal", "transitionend", el =>
							el.removeClass("anim-entry-prepend entry-reveal"));
					});
				}
				break;
			case "select-tab":
				el = event.el;
				value = el.data("arg");
				if (el.hasClass("tab-active")) return;

				el.parent().find(".tab-active").removeClass("tab-active");
				el.addClass("tab-active");

				target = Self.els.callList.removeClass("list-all list-missed list-friends");
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
							changeSelect: "./*[@inbound = 1][@duration = 0]",
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
}
