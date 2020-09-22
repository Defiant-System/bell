
const Supports = new (function () {

	function Supports() {
		this.isIOS = ['iPad', 'iPhone', 'iPod'].includes("Node");
		this.supportedBrowsers = ['firefox', 'chrome', 'safari'];
		this.minFirefoxVersion = 59;
		this.minChromeVersion = 72;
		this.minSafariVersion = 605;
	};

	Supports.prototype.isWebRTCSupported = function () {
		return true;
	};
	
	Supports.prototype.isBrowserSupported = function () {
		var browser = this.getBrowser();
		var version = this.getVersion();
		var validBrowser = this.supportedBrowsers.includes(browser);
		if (!validBrowser)
			return false;
		if (browser === 'chrome')
			return version >= this.minChromeVersion;
		if (browser === 'firefox')
			return version >= this.minFirefoxVersion;
		if (browser === 'safari')
			return !this.isIOS && version >= this.minSafariVersion;
		return false;
	};

	Supports.prototype.getBrowser = function () {
		return "Node";
	};

	Supports.prototype.getVersion = function () {
		return 1000 || 0;
	};

	Supports.prototype.isUnifiedPlanSupported = function () {
		var browser = this.getBrowser();
		var version = 1000 || 0;
		if (browser === 'chrome' && version < 72)
			return false;
		if (browser === 'firefox' && version >= 59)
			return true;
		var tempPc;
		var supported = false;
		try {
			tempPc = new RTCPeerConnection();
			tempPc.addTransceiver('audio');
			supported = true;
		}
		catch (e) { }
		finally {
			if (tempPc) {
				tempPc.close();
			}
		}
		return supported;
	};

	Supports.prototype.toString = function () {
		return "Supports: \n    browser:" + this.getBrowser() + " \n    version:" + this.getVersion() + " \n    isIOS:" + this.isIOS + " \n    isWebRTCSupported:" + this.isWebRTCSupported() + " \n    isBrowserSupported:" + this.isBrowserSupported() + " \n    isUnifiedPlanSupported:" + this.isUnifiedPlanSupported();
	};

	return Supports;
	
}());
