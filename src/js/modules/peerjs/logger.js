
var LoggerClass = (function () {
	
	var LOG_PREFIX = 'PeerJS: ';
	/*
	Prints log messages depending on the debug level passed in. Defaults to 0.
	0  Prints no logs.
	1  Prints only errors.
	2  Prints errors and warnings.
	3  Prints all logs.
	*/
	var LogLevel = {
		"0": "Disabled",
		"1": "Errors",
		"2": "Warnings",
		"3": "All",
		"Disabled": "0",
		"Errors": "1",
		"Warnings": "2",
		"All": "3",
	};

	function Logger() {
		this._logLevel = LogLevel.Disabled;
	}

	Object.defineProperty(Logger.prototype, "logLevel", {
		get: function () { return this._logLevel; },
		set: function (logLevel) { this._logLevel = logLevel; },
		enumerable: true,
		configurable: true
	});

	Logger.prototype.log = function () {
		var args = [];
		for (var _i = 0; _i < arguments.length; _i++) {
			args[_i] = arguments[_i];
		}
		if (this._logLevel >= LogLevel.All) {
			this._print.apply(this, __spread([LogLevel.All], args));
		}
	};

	Logger.prototype.warn = function () {
		var args = [];
		for (var _i = 0; _i < arguments.length; _i++) {
			args[_i] = arguments[_i];
		}
		if (this._logLevel >= LogLevel.Warnings) {
			this._print.apply(this, __spread([LogLevel.Warnings], args));
		}
	};

	Logger.prototype.error = function () {
		var args = [];
		for (var _i = 0; _i < arguments.length; _i++) {
			args[_i] = arguments[_i];
		}
		if (this._logLevel >= LogLevel.Errors) {
			this._print.apply(this, __spread([LogLevel.Errors], args));
		}
	};

	Logger.prototype.setLogFunction = function (fn) {
		this._print = fn;
	};

	Logger.prototype._print = function (logLevel) {
		var rest = [];
		for (var _i = 1; _i < arguments.length; _i++) {
			rest[_i - 1] = arguments[_i];
		}
		var copy = __spread([LOG_PREFIX], rest);
		for (var i in copy) {
			if (copy[i] instanceof Error) {
				copy[i] = "(" + copy[i].name + ") " + copy[i].message;
			}
		}
		if (logLevel >= LogLevel.All) {
			console.log.apply(console, __spread(copy));
		}
		else if (logLevel >= LogLevel.Warnings) {
			console.warn.apply(console, __spread(["WARNING"], copy));
		}
		else if (logLevel >= LogLevel.Errors) {
			console.error.apply(console, __spread(["ERROR"], copy));
		}
	};

	return Logger;

}());

let Logger = new LoggerClass();

