
@import "modules/sidebar.js";
@import "modules/call.js";


const defaultSettings = {
	"clear-history-log": 604800,  // Seven days: 7*24*60*60
};


const ME = karaqu.user;

const bell = {
	els: {},
	init() {
		// fast references
		this.els = {
			content: window.find("content"),
			sidebar: window.find(".sidebar"),
			sidebarToggler: window.find(".sidebar-toggler"),
			callList: window.find(".call-list .list-wrapper"),
			videoCall: window.find(".video-call"),
			videoMe: window.find(".me video"),
			videoOther: window.find(".other"),
		};

		// init auxilliary objects
		Sidebar.init();
		Call.init();

		// auto mute video elements
		// this.els.content.find("video").map(el => { el.muted = true; });

		let Self = this;
		// check storage for previously saved data
		window.storage.getItem("call-history")
			.then(storageData => {
				// reference to history XML
				Self.xHistory = window.bluePrint.selectSingleNode("//History");

				if (storageData) {
					// replace bluePrint data with storage data
					Self.xHistory.parentNode.replaceChild(storageData, Self.xHistory);
					Self.xHistory = window.bluePrint.selectSingleNode(`//History`);
				}
				// get settings, if any
				Self.settings = window.settings.getItem("settings") || defaultSettings;
				// auto clear call log
				let arg = Self.settings["clear-history-log"];
				Sidebar.dispatch({ type: "clear-history-log", arg });
				// translate time stamps
				Self.fixTimestamp();
				// auto click "all" tab
				window.find(".tab-row > div[data-arg='all']").trigger("click");
				// fix menu options
				window.bluePrint.selectNodes(`//Menu[@check-group="clear-log"]`).map(xMenu =>
					(+xMenu.getAttribute("arg") === +arg)
						? xMenu.setAttribute("is-checked", 1)
						: xMenu.removeAttribute("is-checked"));
			});

		/* temp
		this.dispatch({ type: "toggle-sidebar", value: "hide" });

		setTimeout(() => {
			Sidebar.dispatch({
				type: "history-log-call",
				data: {
					user1: "hbi",
					user2: "bill",
					type: "voice",
					stamp: 1595306176929,
					duration: 0,
				}
			});
			
			setTimeout(() => {
				bell.dispatch({ type: "toggle-sidebar", value: "show" });
			}, 100);
		}, 1500);
		*/

		// setTimeout(() => window.find(`div[data-arg="friends"]`).trigger("click"), 800);
	},
	fixTimestamp() {
		this.xHistory.selectNodes("./i").map(call => {
			let timestamp = new karaqu.Moment(+call.getAttribute("stamp"));
			call.setAttribute("timestamp", timestamp.format("ddd D MMM, HH:mm"));
		});
	},
	dispatch(event) {
		let Self = bell,
			el;
		switch (event.type) {
			// system events
			case "window.init":
				// return;
				// initiate camera
				navigator.mediaDevices
					.getUserMedia({ video: true, audio: true })
					.then(stream => {
						let video = Self.els.videoMe[0];
						
						Self.stream = stream;

						video.srcObject = stream;
						video.muted = karaqu.env === "dev";
						video.addEventListener("loadedmetadata", () => {
							video.play();
						});
					});
				break;
			case "window.close":
				// disconnect camera stream
				if (Self.stream) {
					Self.els.videoMe[0].src = "";
					Self.stream.getTracks().map(item => item.stop());
				}
				// save settings
				window.settings.setItem("settings", Self.settings);
				// save call log
				window.storage.setItem("call-history", Self.xHistory);
				break;
			case "net.receive":
				// forward event to Call-object
				Call.receive(event);
				break;
			// custom events
			case "clear-history-log":
			case "toggle-sidebar":
				Sidebar.dispatch(event);
				break;
			default:
				el = event.el ? event.el.parents("[data-area]") : false;
				// proxy event
				if (el && el.hasClass("sidebar")) {
					Sidebar.dispatch(event);
				} else {
					Call.dispatch(event);
				}
		}
	}
};

window.exports = bell;
