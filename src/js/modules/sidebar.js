
const Sidebar = {
	init() {
		// listen to system event
		defiant.on("sys:friend-status", this.dispatch);
	},
	dispatch(event) {
		let APP = bell,
			Self = Sidebar,
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
			case "clear-history-log":
				value = +event.arg;

				switch (value) {
					case 0: // all
						xPath = `./*`;
						break;
					case -1: // keep all
						xPath = `./*[@duration = ${value}]`;
						// save to settings
						APP.settings["clear-history-log"] = event.arg;
						break;
					case -2: // clear missed only
						xPath = `./*[@inbound = 1][@duration = 0]`;
						break;
					default:
						// clear older than "seconds"
						value = Date.now() - (value * 1000);
						xPath = `./*[position() > 20][@stamp < "${value}"]`;
						// save to settings
						APP.settings["clear-history-log"] = event.arg;
				}
				// clear entries from DOM & xHistory
				APP.xHistory.selectNodes(xPath).map(xEntry => {
					let stamp = xEntry.getAttribute("stamp"),
						el = APP.els.sidebar.find(`.call-entry[data-stamp="${stamp}"]`);
					// remove from DOM
					el.remove();
					// remove from xHistory
					xEntry.parentNode.removeChild(xEntry);
				});
				break;
			case "start-camera-call":
			case "start-voice-call":
				Call.dispatch(event);
				break;
			case "history-log-call":
				let meCalling = ME.username === event.data.user1,
					username = meCalling ? event.data.user2 : event.data.user1,
					inbound = ME.username === event.data.user2 ? 1 : 0;
				str = `<i username="${username}"
							inbound="${inbound}"
							type="${event.data.type}"
							stamp="${event.data.stamp}"
							duration="${event.data.duration}"
							_new="1"/>`;
				// add entry to call log
				xNode = APP.xHistory.insertBefore($.nodeFromString(str), APP.xHistory.firstChild);

				// translate time stamps
				APP.fixTimestamp();
				// list wrapper
				prepend = APP.els.callList;
				// skip adding if friends tab is active
				if (prepend.hasClass("list-friends")) return;
				// add entry to DOM
				el = window.render({
							template: "call-entry",
							match: `//Data/History/*[1]`,
							prepend,
						});
				// remove attribute from log entry
				xNode.removeAttribute("_new");
				// remove from 
				if (prepend.hasClass("list-friends") && (meCalling || event.data.duration > 0)) {
					el.remove();
				}
				break;
			case "toggle-sidebar":
				if (event.value === "show") isOn = false;
				isOn = isOn || APP.els.sidebarToggler.hasClass("push-in");
				APP.els.sidebarToggler.toggleClass("push-in", isOn);

				if (isOn) {
					APP.els.sidebar.removeClass("open");
				} else {
					APP.els.sidebar.cssSequence("open", "transitionend", sEl => {
						el = APP.els.callList.find(".anim-entry-prepend");
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
};
