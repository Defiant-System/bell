
import { EventEmitter } from "./EventEmitter.js";
import { Logger } from "./Logger.js";


var EncodingQueue = (function (_super) {

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

	__extends(EncodingQueue, _super);

	function EncodingQueue() {
		var _this = _super.call(this) || this;
		_this.fileReader = new window.FileReader();
		_this._queue = [];
		_this._processing = false;
		_this.fileReader.onload = function (evt) {
			_this._processing = false;
			if (evt.target) {
				_this.emit('done', evt.target.result);
			}
			_this.doNextTask();
		};
		_this.fileReader.onerror = function (evt) {
			Logger.error("EncodingQueue error:", evt);
			_this._processing = false;
			_this.destroy();
			_this.emit('error', evt);
		};
		return _this;
	}
	Object.defineProperty(EncodingQueue.prototype, "queue", {
		get: function () {
			return this._queue;
		},
		enumerable: true,
		configurable: true
	});
	Object.defineProperty(EncodingQueue.prototype, "size", {
		get: function () {
			return this.queue.length;
		},
		enumerable: true,
		configurable: true
	});
	Object.defineProperty(EncodingQueue.prototype, "processing", {
		get: function () {
			return this._processing;
		},
		enumerable: true,
		configurable: true
	});
	EncodingQueue.prototype.enque = function (blob) {
		this.queue.push(blob);
		if (this.processing)
			return;
		this.doNextTask();
	};
	EncodingQueue.prototype.destroy = function () {
		this.fileReader.abort();
		this._queue = [];
	};
	EncodingQueue.prototype.doNextTask = function () {
		if (this.size === 0)
			return;
		if (this.processing)
			return;
		this._processing = true;
		this.fileReader.readAsArrayBuffer(this.queue.shift());
	};

	return EncodingQueue;

}(EventEmitter));

export { EncodingQueue };
