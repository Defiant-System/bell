
import * as util from "./util.js";
import { logger } from "./logger.js";
import { Negotiator } from "./Negotiator.js";
import { BaseConnection } from "./BaseConnection.js";
import { EncodingQueue } from "./EncodingQueue.js";
import {
    SerializationType,
    ConnectionType,
    ConnectionEventType,
    ServerMessageType
} from "./enums.js";


/**
 * Wraps a DataChannel between two Peers.
 */
var DataConnection = (function (_super) {
    
    util.__extends(DataConnection, _super);

    function DataConnection(peerId, provider, options) {
        var _this = _super.call(this, peerId, provider, options) || this;
        _this.stringify = JSON.stringify;
        _this.parse = JSON.parse;
        _this._buffer = [];
        _this._bufferSize = 0;
        _this._buffering = false;
        _this._chunkedData = {};
        _this._encodingQueue = new EncodingQueue();
        _this.connectionId =
            _this.options.connectionId || DataConnection.ID_PREFIX + util.util.randomToken();
        _this.label = _this.options.label || _this.connectionId;
        _this.serialization = _this.options.serialization || SerializationType.Binary;
        _this.reliable = !!_this.options.reliable;
        _this._encodingQueue.on('done', function (ab) {
            _this._bufferedSend(ab);
        });
        _this._encodingQueue.on('error', function () {
            logger.default.error("DC#" + _this.connectionId + ": Error occured in encoding from blob to arraybuffer, close DC");
            _this.close();
        });
        _this._negotiator = new Negotiator(_this);
        _this._negotiator.startConnection(_this.options._payload || {
            originator: true
        });
        return _this;
    }

    Object.defineProperty(DataConnection.prototype, "type", {
        get: function () {
            return ConnectionType.Data;
        },
        enumerable: true,
        configurable: true
    });

    Object.defineProperty(DataConnection.prototype, "dataChannel", {
        get: function () {
            return this._dc;
        },
        enumerable: true,
        configurable: true
    });

    Object.defineProperty(DataConnection.prototype, "bufferSize", {
        get: function () { return this._bufferSize; },
        enumerable: true,
        configurable: true
    });

    /** Called by the Negotiator when the DataChannel is ready. */
    DataConnection.prototype.initialize = function (dc) {
        this._dc = dc;
        this._configureDataChannel();
    };

    DataConnection.prototype._configureDataChannel = function () {
        var _this = this;
        if (!util.util.supports.binaryBlob || util.util.supports.reliable) {
            this.dataChannel.binaryType = "arraybuffer";
        }
        this.dataChannel.onopen = function () {
            logger.default.log("DC#" + _this.connectionId + " dc connection success");
            _this._open = true;
            _this.emit(ConnectionEventType.Open);
        };
        this.dataChannel.onmessage = function (e) {
            logger.default.log("DC#" + _this.connectionId + " dc onmessage:", e.data);
            _this._handleDataMessage(e);
        };
        this.dataChannel.onclose = function () {
            logger.default.log("DC#" + _this.connectionId + " dc closed for:", _this.peer);
            _this.close();
        };
    };

    // Handles a DataChannel message.
    DataConnection.prototype._handleDataMessage = function (_a) {
        var _this = this;
        var data = _a.data;
        var datatype = data.constructor;
        var isBinarySerialization = this.serialization === SerializationType.Binary ||
            this.serialization === SerializationType.BinaryUTF8;
        var deserializedData = data;
        if (isBinarySerialization) {
            if (datatype === window.Blob) {
                // Datatype should never be blob
                util.util.blobToArrayBuffer(data, function (ab) {
                    var unpackedData = util.util.unpack(ab);
                    _this.emit(ConnectionEventType.Data, unpackedData);
                });
                return;
            }
            else if (datatype === ArrayBuffer) {
                deserializedData = util.util.unpack(data);
            }
            else if (datatype === String) {
                // String fallback for binary data for browsers that don't support binary yet
                var ab = util.util.binaryStringToArrayBuffer(data);
                deserializedData = util.util.unpack(ab);
            }
        }
        else if (this.serialization === SerializationType.JSON) {
            deserializedData = this.parse(data);
        }
        // Check if we've chunked--if so, piece things back together.
        // We're guaranteed that this isn't 0.
        if (deserializedData.__peerData) {
            this._handleChunk(deserializedData);
            return;
        }
        _super.prototype.emit.call(this, ConnectionEventType.Data, deserializedData);
    };

    DataConnection.prototype._handleChunk = function (data) {
        var id = data.__peerData;
        var chunkInfo = this._chunkedData[id] || {
            data: [],
            count: 0,
            total: data.total
        };
        chunkInfo.data[data.n] = data.data;
        chunkInfo.count++;
        this._chunkedData[id] = chunkInfo;
        if (chunkInfo.total === chunkInfo.count) {
            // Clean up before making the recursive call to `_handleDataMessage`.
            delete this._chunkedData[id];
            // We've received all the chunks--time to construct the complete data.
            var data_1 = new window.Blob(chunkInfo.data);
            this._handleDataMessage({ data: data_1 });
        }
    };

    /**
     * Exposed functionality for users.
     */
    /** Allows user to close connection. */
    DataConnection.prototype.close = function () {
        this._buffer = [];
        this._bufferSize = 0;
        this._chunkedData = {};
        if (this._negotiator) {
            this._negotiator.cleanup();
            this._negotiator = null;
        }
        if (this.provider) {
            this.provider._removeConnection(this);
            this.provider = null;
        }
        if (this.dataChannel) {
            this.dataChannel.onopen = null;
            this.dataChannel.onmessage = null;
            this.dataChannel.onclose = null;
            this._dc = null;
        }
        if (this._encodingQueue) {
            this._encodingQueue.destroy();
            this._encodingQueue.removeAllListeners();
            this._encodingQueue = null;
        }
        if (!this.open) {
            return;
        }
        this._open = false;
        _super.prototype.emit.call(this, ConnectionEventType.Close);
    };

    /** Allows user to send data. */
    DataConnection.prototype.send = function (data, chunked) {
        if (!this.open) {
            _super.prototype.emit.call(this, ConnectionEventType.Error, new Error("Connection is not open. You should listen for the `open` event before sending messages."));
            return;
        }
        if (this.serialization === SerializationType.JSON) {
            this._bufferedSend(this.stringify(data));
        }
        else if (this.serialization === SerializationType.Binary ||
            this.serialization === SerializationType.BinaryUTF8) {
            var blob = util.util.pack(data);
            if (!chunked && blob.size > util.util.chunkedMTU) {
                this._sendChunks(blob);
                return;
            }
            if (!util.util.supports.binaryBlob) {
                // We only do this if we really need to (e.g. blobs are not supported),
                // because this conversion is costly.
                this._encodingQueue.enque(blob);
            }
            else {
                this._bufferedSend(blob);
            }
        }
        else {
            this._bufferedSend(data);
        }
    };

    DataConnection.prototype._bufferedSend = function (msg) {
        if (this._buffering || !this._trySend(msg)) {
            this._buffer.push(msg);
            this._bufferSize = this._buffer.length;
        }
    };

    // Returns true if the send succeeds.
    DataConnection.prototype._trySend = function (msg) {
        var _this = this;
        if (!this.open) {
            return false;
        }
        if (this.dataChannel.bufferedAmount > DataConnection.MAX_BUFFERED_AMOUNT) {
            this._buffering = true;
            setTimeout(function () {
                _this._buffering = false;
                _this._tryBuffer();
            }, 50);
            return false;
        }
        try {
            this.dataChannel.send(msg);
        }
        catch (e) {
            logger.default.error("DC#:" + this.connectionId + " Error when sending:", e);
            this._buffering = true;
            this.close();
            return false;
        }
        return true;
    };

    // Try to send the first message in the buffer.
    DataConnection.prototype._tryBuffer = function () {
        if (!this.open) {
            return;
        }
        if (this._buffer.length === 0) {
            return;
        }
        var msg = this._buffer[0];
        if (this._trySend(msg)) {
            this._buffer.shift();
            this._bufferSize = this._buffer.length;
            this._tryBuffer();
        }
    };

    DataConnection.prototype._sendChunks = function (blob) {
        var e_1, _a;
        var blobs = util.util.chunk(blob);
        logger.default.log("DC#" + this.connectionId + " Try to send " + blobs.length + " chunks...");
        try {
            for (var blobs_1 = util.__values(blobs), blobs_1_1 = blobs_1.next(); !blobs_1_1.done; blobs_1_1 = blobs_1.next()) {
                var blob_1 = blobs_1_1.value;
                this.send(blob_1, true);
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (blobs_1_1 && !blobs_1_1.done && (_a = blobs_1.return)) _a.call(blobs_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
    };

    DataConnection.prototype.handleMessage = function (message) {
        var payload = message.payload;
        switch (message.type) {
            case ServerMessageType.Answer:
                this._negotiator.handleSDP(message.type, payload.sdp);
                break;
            case ServerMessageType.Candidate:
                this._negotiator.handleCandidate(payload.candidate);
                break;
            default:
                logger.default.warn("Unrecognized message type:", message.type, "from peer:", this.peer);
                break;
        }
    };

    DataConnection.ID_PREFIX = "dc_";

    DataConnection.MAX_BUFFERED_AMOUNT = 8 * 1024 * 1024;

    return DataConnection;

}(BaseConnection));

export { DataConnection };
