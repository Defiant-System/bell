
import { BinaryPack } from "./BinaryPack.js";
import { Supports } from "./Supports.js";

const DEFAULT_CONFIG = {
	iceServers: [
		{ urls: "stun:stun.l.google.com:19302" },
		{ urls: "turn:0.peerjs.com:3478", username: "peerjs", credential: "peerjsp" }
	],
	sdpSemantics: "unified-plan"
};


const util = new (function () {
	function class_1() {
		this.CLOUD_HOST = "0.peerjs.com";
		this.CLOUD_PORT = 443;
		// Browsers that need chunking:
		this.chunkedBrowsers = { Chrome: 1, chrome: 1 };
		this.chunkedMTU = 16300; // The original 60000 bytes setting does not work when sending data from Firefox to Chrome, which is "cut off" after 16384 bytes and delivered individually.
		// Returns browser-agnostic default config
		this.defaultConfig = DEFAULT_CONFIG;
		this.browser = Supports.getBrowser();
		this.browserVersion = Supports.getVersion();
		// Lists which features are supported
		this.supports = (function () {
			var supported = {
				browser: Supports.isBrowserSupported(),
				webRTC: Supports.isWebRTCSupported(),
				audioVideo: false,
				data: false,
				binaryBlob: false,
				reliable: false,
			};
			if (!supported.webRTC)
				return supported;
			var pc;
			try {
				pc = new RTCPeerConnection(DEFAULT_CONFIG);
				supported.audioVideo = true;
				var dc = void 0;
				try {
					dc = pc.createDataChannel("_PEERJSTEST", { ordered: true });
					supported.data = true;
					supported.reliable = !!dc.ordered;
					// Binary test
					try {
						dc.binaryType = "blob";
						supported.binaryBlob = !Supports.isIOS;
					}
					catch (e) {
					}
				}
				catch (e) {
				}
				finally {
					if (dc) {
						dc.close();
					}
				}
			}
			catch (e) {
			}
			finally {
				if (pc) {
					pc.close();
				}
			}
			return supported;
		})();

		this.pack = BinaryPack.pack;
		this.unpack = BinaryPack.unpack;
		// Binary stuff
		this._dataCount = 1;
	}

	class_1.prototype.noop = function () { };

	// Ensure alphanumeric ids
	class_1.prototype.validateId = function (id) {
		// Allow empty ids
		return !id || /^[A-Za-z0-9]+(?:[ _-][A-Za-z0-9]+)*$/.test(id);
	};

	class_1.prototype.chunk = function (blob) {
		var chunks = [];
		var size = blob.size;
		var total = Math.ceil(size / exports.util.chunkedMTU);
		var index = 0;
		var start = 0;
		while (start < size) {
			var end = Math.min(size, start + exports.util.chunkedMTU);
			var b = blob.slice(start, end);
			var chunk = {
				__peerData: this._dataCount,
				n: index,
				data: b,
				total: total,
			};
			chunks.push(chunk);
			start = end;
			index++;
		}
		this._dataCount++;
		return chunks;
	};

	class_1.prototype.blobToArrayBuffer = function (blob, cb) {
		var fr = new FileReader();
		fr.onload = function (evt) {
			if (evt.target) {
				cb(evt.target.result);
			}
		};
		fr.readAsArrayBuffer(blob);
		return fr;
	};

	class_1.prototype.binaryStringToArrayBuffer = function (binary) {
		var byteArray = new Uint8Array(binary.length);
		for (var i = 0; i < binary.length; i++) {
			byteArray[i] = binary.charCodeAt(i) & 0xff;
		}
		return byteArray.buffer;
	};

	class_1.prototype.randomToken = function () {
		return Math.random()
			.toString(36)
			.substr(2);
	};

	class_1.prototype.isSecure = function () {
		return true;
	};

	return class_1;
}());



var __awaiter = function (thisArg, _arguments, P, generator) {
	function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
	return new (P || (P = Promise))(function (resolve, reject) {
		function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
		function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
		function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
		step((generator = generator.apply(thisArg, _arguments || [])).next());
	});
};

var __generator = function (thisArg, body) {
	var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
	return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
	function verb(n) { return function (v) { return step([n, v]); }; }
	function step(op) {
		if (f) throw new TypeError("Generator is already executing.");
		while (_) try {
			if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
			if (y = 0, t) op = [op[0] & 2, t.value];
			switch (op[0]) {
				case 0: case 1: t = op; break;
				case 4: _.label++; return { value: op[1], done: false };
				case 5: _.label++; y = op[1]; op = [0]; continue;
				case 7: op = _.ops.pop(); _.trys.pop(); continue;
				default:
					if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
					if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
					if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
					if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
					if (t[2]) _.ops.pop();
					_.trys.pop(); continue;
			}
			op = body.call(thisArg, _);
		} catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
		if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
	}
};

var __extends = (function () {
	var extendStatics = function (d, b) {
		extendStatics = Object.setPrototypeOf ||
			({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
			function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
		return extendStatics(d, b);
	};
	return function (d, b) {
		extendStatics(d, b);
		function __() { this.constructor = d; }
		d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
})();

var __read = function (o, n) {
	var m = typeof Symbol === "function" && o[Symbol.iterator];
	if (!m) return o;
	var i = m.call(o), r, ar = [], e;
	try {
		while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
	}
	catch (error) { e = { error: error }; }
	finally {
		try {
			if (r && !r.done && (m = i["return"])) m.call(i);
		}
		finally { if (e) throw e.error; }
	}
	return ar;
};

var __spread = function () {
	for (var ar = [], i = 0; i < arguments.length; i++) ar = ar.concat(__read(arguments[i]));
	return ar;
};

var __values = function(o) {
	var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
	if (m) return m.call(o);
	if (o && typeof o.length === "number") return {
		next: function () {
			if (o && i >= o.length) o = void 0;
			return { value: o && o[i++], done: !o };
		}
	};
	throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};

var __assign = function () {
	__assign = Object.assign || function(t) {
		for (var s, i = 1, n = arguments.length; i < n; i++) {
			s = arguments[i];
			for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
				t[p] = s[p];
		}
		return t;
	};
	return __assign.apply(this, arguments);
};




export {
	util,
	__awaiter,
	__generator,
	__extends,
	__assign,
	__read,
	__spread,
	__values,
};
