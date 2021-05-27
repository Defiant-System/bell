
@import "modules/sidebar.js";
@import "modules/call.js";


const ME = defiant.user;

const edison = {
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

		// reference to history XML
		this.xHistory = window.bluePrint.selectSingleNode("//History");

		// translate time stamps
		this.fixTimestamp();

		// auto click "all" tab
		window.find(".tab-row > div[data-arg='all']").trigger("click");

		// auto mute video elements
		// this.els.content.find("video").map(el => { el.muted = true; });

		// temp
		// setTimeout(() => {
		// 	Sidebar.dispatch({
		// 		type: "history-log-call",
		// 		data: {
		// 			user1: "hbi",
		// 			user2: "bill",
		// 			type: "voice",
		// 			stamp: 1595306176929,
		// 			duration: 0,
		// 		}
		// 	});
		// }, 1000);

		// if (ME.username === "bill") {
		// 	window.find(".call-list .call-entry[data-username='hbi'] [data-click='start-camera-call']").trigger("click");
		// }
	},
	fixTimestamp() {
		this.xHistory.selectNodes("./i").map(call => {
			let timestamp = new defiant.Moment(+call.getAttribute("stamp"));
			call.setAttribute("timestamp", timestamp.format("ddd D MMM, HH:mm"));
		});
	},
	dispatch(event) {
		let Self = edison,
			el;
		switch (event.type) {
			// system events
			case "window.open":
				// return;
				navigator.mediaDevices
					.getUserMedia({ video: true, audio: true })
					.then(stream => {
						let video = Self.els.videoMe[0];
						
						Self.stream = stream;

						video.srcObject = stream;
						video.muted = defiant.env === "dev";
						video.addEventListener("loadedmetadata", () => {
							video.play();
						});
					});
				break;
			case "net.receive":
				// forward event to Call-object
				Call.receive(event);
				break;
			case "window.close":
				if (Self.stream) {
					Self.els.videoMe[0].src = "";
					Self.stream.getTracks().map(item => item.stop());
				}
				break;
			// custom events
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

window.exports = edison;
