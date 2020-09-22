
/**
 * Manages all negotiations between Peers.
 */
var Negotiator = (function () {

	function Negotiator(connection) {
		this.connection = connection;
	}

	/** Returns a PeerConnection object set up correctly (for data, media). */
	Negotiator.prototype.startConnection = function (options) {
		var peerConnection = this._startPeerConnection();
		// Set the connection's PC.
		this.connection.peerConnection = peerConnection;
		if (this.connection.type === Enums.ConnectionType.Media && options._stream) {
			this._addTracksToConnection(options._stream, peerConnection);
		}
		// What do we need to do now?
		if (options.originator) {
			if (this.connection.type === Enums.ConnectionType.Data) {
				var dataConnection = this.connection;
				var config = { ordered: !!options.reliable };
				var dataChannel = peerConnection.createDataChannel(dataConnection.label, config);
				dataConnection.initialize(dataChannel);
			}
			this._makeOffer();
		}
		else {
			this.handleSDP("OFFER", options.sdp);
		}
	};

	/** Start a PC. */
	Negotiator.prototype._startPeerConnection = function () {
		Logger.log("Creating RTCPeerConnection.");
		var peerConnection = new RTCPeerConnection(this.connection.provider.options.config);
		this._setupListeners(peerConnection);
		return peerConnection;
	};

	/** Set up various WebRTC listeners. */
	Negotiator.prototype._setupListeners = function (peerConnection) {
		var _this = this;
		var peerId = this.connection.peer;
		var connectionId = this.connection.connectionId;
		var connectionType = this.connection.type;
		var provider = this.connection.provider;
		// ICE CANDIDATES.
		Logger.log("Listening for ICE candidates.");
		peerConnection.onicecandidate = function (evt) {
			if (!evt.candidate || !evt.candidate.candidate)
				return;
			Logger.log("Received ICE candidates for " + peerId + ":", evt.candidate);
			provider.socket.send({
				type: Enums.ServerMessageType.Candidate,
				payload: {
					candidate: evt.candidate,
					type: connectionType,
					connectionId: connectionId
				},
				dst: peerId
			});
		};
		peerConnection.oniceconnectionstatechange = function () {
			switch (peerConnection.iceConnectionState) {
				case "failed":
					Logger.log("iceConnectionState is failed, closing connections to " +
						peerId);
					_this.connection.emit(Enums.ConnectionEventType.Error, new Error("Negotiation of connection to " + peerId + " failed."));
					_this.connection.close();
					break;
				case "closed":
					Logger.log("iceConnectionState is closed, closing connections to " +
						peerId);
					_this.connection.emit(Enums.ConnectionEventType.Error, new Error("Connection to " + peerId + " closed."));
					_this.connection.close();
					break;
				case "disconnected":
					Logger.log("iceConnectionState is disconnected, closing connections to " +
						peerId);
					_this.connection.emit(Enums.ConnectionEventType.Error, new Error("Connection to " + peerId + " disconnected."));
					_this.connection.close();
					break;
				case "completed":
					peerConnection.onicecandidate = util.noop;
					break;
			}
			_this.connection.emit(Enums.ConnectionEventType.IceStateChanged, peerConnection.iceConnectionState);
		};
		// DATACONNECTION.
		Logger.log("Listening for data channel");
		// Fired between offer and answer, so options should already be saved
		// in the options hash.
		peerConnection.ondatachannel = function (evt) {
			Logger.log("Received data channel");
			var dataChannel = evt.channel;
			var connection = (provider.getConnection(peerId, connectionId));
			connection.initialize(dataChannel);
		};
		// MEDIACONNECTION.
		Logger.log("Listening for remote stream");
		peerConnection.ontrack = function (evt) {
			Logger.log("Received remote stream");
			var stream = evt.streams[0];
			var connection = provider.getConnection(peerId, connectionId);
			if (connection.type === Enums.ConnectionType.Media) {
				var mediaConnection = connection;
				_this._addStreamToMediaConnection(stream, mediaConnection);
			}
		};
	};

	Negotiator.prototype.cleanup = function () {
		Logger.log("Cleaning up PeerConnection to " + this.connection.peer);
		var peerConnection = this.connection.peerConnection;
		if (!peerConnection) {
			return;
		}
		this.connection.peerConnection = null;
		//unsubscribe from all PeerConnection's events
		// peerConnection.onIceCandidate = peerConnection.oniceconnectionstatechange = peerConnection.ondatachannel = peerConnection.ontrack = () => { };
		var peerConnectionNotClosed = peerConnection.signalingState !== "closed";
		var dataChannelNotClosed = false;
		if (this.connection.type === Enums.ConnectionType.Data) {
			var dataConnection = this.connection;
			var dataChannel = dataConnection.dataChannel;
			if (dataChannel) {
				dataChannelNotClosed = !!dataChannel.readyState && dataChannel.readyState !== "closed";
			}
		}
		if (peerConnectionNotClosed || dataChannelNotClosed) {
			peerConnection.close();
		}
	};

	Negotiator.prototype._makeOffer = function () {
		return __awaiter(this, void 0, void 0, function () {
			var peerConnection, provider, offer, payload, dataConnection, err_2, err_1_1;
			return __generator(this, function (_a) {
				switch (_a.label) {
					case 0:
						peerConnection = this.connection.peerConnection;
						provider = this.connection.provider;
						_a.label = 1;
					case 1:
						_a.trys.push([1, 7, , 8]);
						return [4 /*yield*/, peerConnection.createOffer(this.connection.options.constraints)];
					case 2:
						offer = _a.sent();
						Logger.log("Created offer.");
						if (this.connection.options.sdpTransform && typeof this.connection.options.sdpTransform === 'function') {
							offer.sdp = this.connection.options.sdpTransform(offer.sdp) || offer.sdp;
						}
						_a.label = 3;
					case 3:
						_a.trys.push([3, 5, , 6]);
						return [4 /*yield*/, peerConnection.setLocalDescription(offer)];
					case 4:
						_a.sent();
						Logger.log("Set localDescription:", offer, "for:" + this.connection.peer);
						payload = {
							sdp: offer,
							type: this.connection.type,
							connectionId: this.connection.connectionId,
							metadata: this.connection.metadata,
							browser: util.browser
						};
						if (this.connection.type === Enums.ConnectionType.Data) {
							dataConnection = this.connection;

							payload = Object.assign(Object.assign({}, payload), { label: dataConnection.label, reliable: dataConnection.reliable, serialization: dataConnection.serialization });
						}
						provider.socket.send({
							type: Enums.ServerMessageType.Offer,
							payload: payload,
							dst: this.connection.peer
						});
						return [3 /*break*/, 6];
					case 5:
						err_2 = _a.sent();
						// TODO: investigate why _makeOffer is being called from the answer
						if (err_2 !=
							"OperationError: Failed to set local offer sdp: Called in wrong state: kHaveRemoteOffer") {
							provider.emitError(Enums.PeerErrorType.WebRTC, err_2);
							Logger.log("Failed to setLocalDescription, ", err_2);
						}
						return [3 /*break*/, 6];
					case 6: return [3 /*break*/, 8];
					case 7:
						err_1_1 = _a.sent();
						provider.emitError(Enums.PeerErrorType.WebRTC, err_1_1);
						Logger.log("Failed to createOffer, ", err_1_1);
						return [3 /*break*/, 8];
					case 8: return [2 /*return*/];
				}
			});
		});
	};

	Negotiator.prototype._makeAnswer = function () {
		return __awaiter(this, void 0, void 0, function () {
			var peerConnection, provider, answer, err_3, err_1_2;
			return __generator(this, function (_a) {
				switch (_a.label) {
					case 0:
						peerConnection = this.connection.peerConnection;
						provider = this.connection.provider;
						_a.label = 1;
					case 1:
						_a.trys.push([1, 7, , 8]);
						return [4 /*yield*/, peerConnection.createAnswer()];
					case 2:
						answer = _a.sent();
						Logger.log("Created answer.");
						if (this.connection.options.sdpTransform && typeof this.connection.options.sdpTransform === 'function') {
							answer.sdp = this.connection.options.sdpTransform(answer.sdp) || answer.sdp;
						}
						_a.label = 3;
					case 3:
						_a.trys.push([3, 5, , 6]);
						return [4 /*yield*/, peerConnection.setLocalDescription(answer)];
					case 4:
						_a.sent();
						Logger.log("Set localDescription:", answer, "for:" + this.connection.peer);
						provider.socket.send({
							type: Enums.ServerMessageType.Answer,
							payload: {
								sdp: answer,
								type: this.connection.type,
								connectionId: this.connection.connectionId,
								browser: util.browser
							},
							dst: this.connection.peer
						});
						return [3 /*break*/, 6];
					case 5:
						err_3 = _a.sent();
						provider.emitError(Enums.PeerErrorType.WebRTC, err_3);
						Logger.log("Failed to setLocalDescription, ", err_3);
						return [3 /*break*/, 6];
					case 6: return [3 /*break*/, 8];
					case 7:
						err_1_2 = _a.sent();
						provider.emitError(Enums.PeerErrorType.WebRTC, err_1_2);
						Logger.log("Failed to create answer, ", err_1_2);
						return [3 /*break*/, 8];
					case 8: return [2 /*return*/];
				}
			});
		});
	};

	/** Handle an SDP. */
	Negotiator.prototype.handleSDP = function (type, sdp) {
		return __awaiter(this, void 0, void 0, function () {
			var peerConnection, provider, self, err_4;
			return __generator(this, function (_a) {
				switch (_a.label) {
					case 0:
						sdp = new RTCSessionDescription(sdp);
						peerConnection = this.connection.peerConnection;
						provider = this.connection.provider;
						Logger.log("Setting remote description", sdp);
						self = this;
						_a.label = 1;
					case 1:
						_a.trys.push([1, 5, , 6]);
						return [4 /*yield*/, peerConnection.setRemoteDescription(sdp)];
					case 2:
						_a.sent();
						Logger.log("Set remoteDescription:" + type + " for:" + this.connection.peer);
						if (!(type === "OFFER")) return [3 /*break*/, 4];
						return [4 /*yield*/, self._makeAnswer()];
					case 3:
						_a.sent();
						_a.label = 4;
					case 4: return [3 /*break*/, 6];
					case 5:
						err_4 = _a.sent();
						provider.emitError(Enums.PeerErrorType.WebRTC, err_4);
						Logger.log("Failed to setRemoteDescription, ", err_4);
						return [3 /*break*/, 6];
					case 6: return [2 /*return*/];
				}
			});
		});
	};

	/** Handle a candidate. */
	Negotiator.prototype.handleCandidate = function (ice) {
		return __awaiter(this, void 0, void 0, function () {
			var candidate, sdpMLineIndex, sdpMid, peerConnection, provider, err_5;
			return __generator(this, function (_a) {
				switch (_a.label) {
					case 0:
						Logger.log("handleCandidate:", ice);
						candidate = ice.candidate;
						sdpMLineIndex = ice.sdpMLineIndex;
						sdpMid = ice.sdpMid;
						peerConnection = this.connection.peerConnection;
						provider = this.connection.provider;
						_a.label = 1;
					case 1:
						_a.trys.push([1, 3, , 4]);
						return [4 /*yield*/, peerConnection.addIceCandidate(new RTCIceCandidate({
								sdpMid: sdpMid,
								sdpMLineIndex: sdpMLineIndex,
								candidate: candidate
							}))];
					case 2:
						_a.sent();
						Logger.log("Added ICE candidate for:" + this.connection.peer);
						return [3 /*break*/, 4];
					case 3:
						err_5 = _a.sent();
						provider.emitError(Enums.PeerErrorType.WebRTC, err_5);
						Logger.log("Failed to handleCandidate, ", err_5);
						return [3 /*break*/, 4];
					case 4: return [2 /*return*/];
				}
			});
		});
	};

	Negotiator.prototype._addTracksToConnection = function (stream, peerConnection) {
		Logger.log("add tracks from stream " + stream.id + " to peer connection");
		if (!peerConnection.addTrack) {
			return Logger.error("Your browser does't support RTCPeerConnection#addTrack. Ignored.");
		}
		stream.getTracks().forEach(function (track) {
			peerConnection.addTrack(track, stream);
		});
	};
	
	Negotiator.prototype._addStreamToMediaConnection = function (stream, mediaConnection) {
		Logger.log("add stream " + stream.id + " to media connection " + mediaConnection.connectionId);
		mediaConnection.addStream(stream);
	};
	
	return Negotiator;

}());
