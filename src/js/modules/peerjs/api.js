
import * as Utils from "./utils.js";
import { Logger } from "./Logger.js";


var API = (function () {

	function API(_options) {
		this._options = _options;
	}

	API.prototype._buildUrl = function (method) {
		var protocol = this._options.secure ? "https://" : "http://";
		var url = protocol +
			this._options.host +
			":" +
			this._options.port +
			this._options.path +
			this._options.key +
			"/" +
			method;
		var queryString = "?ts=" + new Date().getTime() + "" + Math.random();
		url += queryString;
		return url;
	};

	/** Get a unique ID from the server via XHR and initialize with it. */
	API.prototype.retrieveId = function () {
		return Utils.__awaiter(this, void 0, void 0, function () {
			var url, response, error_1, pathError;
			return Utils.__generator(this, function (_a) {
				switch (_a.label) {
					case 0:
						url = this._buildUrl("id");
						_a.label = 1;
					case 1:
						_a.trys.push([1, 3, , 4]);
						return [4 /*yield*/, window.fetch(url)];
					case 2:
						response = _a.sent();
						if (response.status !== 200) {
							throw new Error("Error. Status:" + response.status);
						}
						return [2 /*return*/, response.text()];
					case 3:
						error_1 = _a.sent();
						Logger.error("Error retrieving ID", error_1);
						pathError = "";
						if (this._options.path === "/" &&
							this._options.host !== Utils.util.CLOUD_HOST) {
							pathError =
								" If you passed in a `path` to your self-hosted PeerServer, " +
									"you'll also need to pass in that same path when creating a new " +
									"Peer.";
						}
						throw new Error("Could not get an ID from the server." + pathError);
					case 4: return [2 /*return*/];
				}
			});
		});
	};

	/** @deprecated */
	API.prototype.listAllPeers = function () {
		return Utils.__awaiter(this, void 0, void 0, function () {
			var url, response, helpfulError, error_2;
			return Utils.__generator(this, function (_a) {
				switch (_a.label) {
					case 0:
						url = this._buildUrl("peers");
						_a.label = 1;
					case 1:
						_a.trys.push([1, 3, , 4]);
						return [4 /*yield*/, window.fetch(url)];
					case 2:
						response = _a.sent();
						if (response.status !== 200) {
							if (response.status === 401) {
								helpfulError = "";
								if (this._options.host === Utils.util.CLOUD_HOST) {
									helpfulError =
										"It looks like you're using the cloud server. You can email " +
											"team@peerjs.com to enable peer listing for your API key.";
								}
								else {
									helpfulError =
										"You need to enable `allow_discovery` on your self-hosted " +
											"PeerServer to use this feature.";
								}
								throw new Error("It doesn't look like you have permission to list peers IDs. " +
									helpfulError);
							}
							throw new Error("Error. Status:" + response.status);
						}
						return [2 /*return*/, response.json()];
					case 3:
						error_2 = _a.sent();
						Logger.error("Error retrieving list peers", error_2);
						throw new Error("Could not get list peers from the server." + error_2);
					case 4: return [2 /*return*/];
				}
			});
		});
	};

	return API;

}());

export { API };
