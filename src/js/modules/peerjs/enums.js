
const Enums = {
	ConnectionEventType: {
		Open: "open",
		Stream: "stream",
		Data: "data",
		Close: "close",
		Error: "error",
		IceStateChanged: "iceStateChanged",
	},
	ConnectionType: {
		Data: "data",
		Media: "media",
	},
	PeerEventType: {
		Open: "open",
		Close: "close",
		Connection: "connection",
		Call: "call",
		Disconnected: "disconnected",
		Error: "error",
	},
	PeerErrorType: {
		BrowserIncompatible: "browser-incompatible",
		Disconnected: "disconnected",
		InvalidID: "invalid-id",
		InvalidKey: "invalid-key",
		Network: "network",
		PeerUnavailable: "peer-unavailable",
		SslUnavailable: "ssl-unavailable",
		ServerError: "server-error",
		SocketError: "socket-error",
		SocketClosed: "socket-closed",
		UnavailableID: "unavailable-id",
		WebRTC: "webrtc",
	},
	SerializationType: {
		Binary: "binary",
		BinaryUTF8: "binary-utf8",
		JSON: "json",
	},
	SocketEventType: {
		Message: "message",
		Disconnected: "disconnected",
		Error: "error",
		Close: "close",
	},
	ServerMessageType: {
		Heartbeat: "HEARTBEAT",
		Candidate: "CANDIDATE",
		Offer: "OFFER",
		Answer: "ANSWER",
		Open: "OPEN",
		Error: "ERROR",
		IdTaken: "ID-TAKEN",
		InvalidKey: "INVALID-KEY",
		Leave: "LEAVE",
		Expire: "EXPIRE",
	}
};
