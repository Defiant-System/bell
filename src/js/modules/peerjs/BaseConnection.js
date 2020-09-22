
import * as util from "./util.js";
import { EventEmitter } from "./eventemitter.js";

var BaseConnection = (function (_super) {

    util.__extends(BaseConnection, _super);
    
    function BaseConnection(peer, provider, options) {
        var _this = _super.call(this) || this;
        _this.peer = peer;
        _this.provider = provider;
        _this.options = options;
        _this._open = false;
        _this.metadata = options.metadata;
        return _this;
    }

    Object.defineProperty(BaseConnection.prototype, "open", {
        get: function () {
            return this._open;
        },
        enumerable: true,
        configurable: true
    });

    return BaseConnection;

}(EventEmitter));

export { BaseConnection };
