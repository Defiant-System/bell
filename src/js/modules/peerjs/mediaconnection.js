
import * as util from "./util.js";
import { logger } from "./logger.js";
import { Negotiator } from "./Negotiator.js"
import { BaseConnection } from "./BaseConnection.js"
import { ConnectionType, ConnectionEventType, ServerMessageType } from "./enums.js";


/**
 * Wraps the streaming interface between two Peers.
 */
var MediaConnection = (function (_super) {

    util.__extends(MediaConnection, _super);

    function MediaConnection(peerId, provider, options) {
        var _this = _super.call(this, peerId, provider, options) || this;
        _this._localStream = _this.options._stream;
        _this.connectionId =
            _this.options.connectionId ||
                MediaConnection.ID_PREFIX + util.util.randomToken();
        _this._negotiator = new Negotiator(_this);
        if (_this._localStream) {
            _this._negotiator.startConnection({
                _stream: _this._localStream,
                originator: true
            });
        }
        return _this;
    }

    Object.defineProperty(MediaConnection.prototype, "type", {
        get: function () {
            return ConnectionType.Media;
        },
        enumerable: true,
        configurable: true
    });

    Object.defineProperty(MediaConnection.prototype, "localStream", {
        get: function () { return this._localStream; },
        enumerable: true,
        configurable: true
    });

    Object.defineProperty(MediaConnection.prototype, "remoteStream", {
        get: function () { return this._remoteStream; },
        enumerable: true,
        configurable: true
    });

    MediaConnection.prototype.addStream = function (remoteStream) {
        logger.default.log("Receiving stream", remoteStream);
        this._remoteStream = remoteStream;
        _super.prototype.emit.call(this, ConnectionEventType.Stream, remoteStream); // Should we call this `open`?
    };

    MediaConnection.prototype.handleMessage = function (message) {
        var type = message.type;
        var payload = message.payload;
        switch (message.type) {
            case ServerMessageType.Answer:
                // Forward to negotiator
                this._negotiator.handleSDP(type, payload.sdp);
                this._open = true;
                break;
            case ServerMessageType.Candidate:
                this._negotiator.handleCandidate(payload.candidate);
                break;
            default:
                logger.default.warn("Unrecognized message type:" + type + " from peer:" + this.peer);
                break;
        }
    };

    MediaConnection.prototype.answer = function (stream, options) {
        var e_1, _a;
        if (options === void 0) { options = {}; }
        if (this._localStream) {
            logger.default.warn("Local stream already exists on this MediaConnection. Are you answering a call twice?");
            return;
        }
        this._localStream = stream;
        if (options && options.sdpTransform) {
            this.options.sdpTransform = options.sdpTransform;
        }
        this._negotiator.startConnection(util.__assign(util.__assign({}, this.options._payload), { _stream: stream }));
        // Retrieve lost messages stored because PeerConnection not set up.
        var messages = this.provider._getMessages(this.connectionId);
        try {
            for (var messages_1 = util.__values(messages), messages_1_1 = messages_1.next(); !messages_1_1.done; messages_1_1 = messages_1.next()) {
                var message = messages_1_1.value;
                this.handleMessage(message);
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (messages_1_1 && !messages_1_1.done && (_a = messages_1.return)) _a.call(messages_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
        this._open = true;
    };

    /**
     * Exposed functionality for users.
     */
    /** Allows user to close connection. */
    MediaConnection.prototype.close = function () {
        if (this._negotiator) {
            this._negotiator.cleanup();
            this._negotiator = null;
        }
        this._localStream = null;
        this._remoteStream = null;
        if (this.provider) {
            this.provider._removeConnection(this);
            this.provider = null;
        }
        if (this.options && this.options._stream) {
            this.options._stream = null;
        }
        if (!this.open) {
            return;
        }
        this._open = false;
        _super.prototype.emit.call(this, ConnectionEventType.Close);
    };
    
    MediaConnection.ID_PREFIX = "mc_";
    
    return MediaConnection;

}(BaseConnection));

export { MediaConnection };
