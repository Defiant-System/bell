
// bell.sidebar

{
	init() {
		// fast references
		this.els = {
			content: window.find("content"),
			sidebar: window.find(".sidebar"),
			sidebarToggler: window.find(".sidebar-toggler"),
			callList: window.find(".call-list .list-wrapper"),
			input: window.find(".sidebar .input-wrapper input"),
		};
		// listen to system event
		window.on("sys:friend-status", this.dispatch);
		window.on("sys:friend-added", this.dispatch);
		window.on("sys:friend-removed", this.dispatch);
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
			str,
			pEl,
			el;
		// console.log(event);
		switch (event.type) {
			// system events
			case "window.keyup":
				value = Self.els.input.val().toLowerCase();
				Self.els.callList
					.find("> div[data-name]").addClass("collapse")
					.filter(e => e.getAttribute("data-name").toLowerCase().startsWith(value))
					.removeClass("collapse");
				break;
			// subscribed events
			case "friend-status":
				user = event.detail.username;
				value = event.detail.status === 1 ? "online" : "offline";
				el = Self.els.callList.find(`div[data-username="${user}"]`);
				// update user status
				el.removeClass("online offline").addClass(value);
				break;
			case "friend-added":
				if (Self.els.sidebar.find(".tab-active").data("arg") === "friends") {
					// render channels
					let vdom = window.render({
							template: "friends",
							match: "sys://Settings/Friends",
							vdom: true
						});
					// vdom.find(`.friend`).map(el => console.log(el));
					let vEl = vdom.find(`.friend[data-username="${event.detail.username}"]`);
					
					// insert new friend at "index"
					pEl = Self.els.sidebar.find(`.list-friends .friend:nth(${vEl.index()-1})`);
					if (pEl.length) pEl.after(vEl);
					else Self.els.sidebar.find(`.list-friends`).append(vEl);
				}
				break;
			case "friend-removed":
				if (Self.els.sidebar.find(".tab-active").data("arg") === "friends") {
					// remove from view
					Self.els.sidebar.find(`.list-friends .friend[data-username="${event.detail.username}"]`).remove();
				}
				// TODO: delete logs from "//Data" ??
				break;
			// custom events
			case "add-friend":
				karaqu.shell("sys -o");
				break;
			case "start-camera-call":
				el = event.el.parents(`div[data-username]`);
				APP.call.dispatch({ type: "outbound-camera-request", to: el.data("username") });
				break;
			case "start-voice-call":
				el = event.el.parents(`div[data-username]`);
				APP.call.dispatch({ type: "outbound-voice-request", to: el.data("username") });
				break;
			case "apply-settings":
				if (APP.settings.sidebar.expanded) {
					Self.els.sidebarToggler.find("> i").trigger("click");
				}
				value = APP.settings.sidebar["active-tab"];
				Self.els.sidebar.find(`.tab-row > div:nth(${value})`).trigger("click");
				break;
			case "select-tab":
				el = event.el;
				value = el.data("arg");
				if (el.hasClass("tab-active")) return;
				el.parent().find(".tab-active").removeClass("tab-active");
				el.addClass("tab-active");
				// reset potential "new" entries
				APP.history.xData.selectNodes(`//*[@_new]`).map(x => x.removeAttribute("_new"));
				// reset input field
				Self.els.input.val("");

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
			case "log-call":
				// add entry to call log
				xNode = APP.history.dispatch(event);
				// list wrapper
				prepend = Self.els.callList;
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
				// animation on next tick
				requestAnimationFrame(() =>
					el.cssSequence("entry-reveal", "transitionend", elem =>
						elem.removeClass("entry-reveal anim-entry-prepend")));
				break;
		}
	}
}
