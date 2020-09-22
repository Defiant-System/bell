
const ConnectionEventType = {
    Open: "open",
    Stream: "stream",
    Data: "data",
    Close: "close",
    Error: "error",
    IceStateChanged: "iceStateChanged",
};

const ConnectionType = {
    Data: "data",
    Media: "media",
};

const PeerEventType = {
    Open: "open",
    Close: "close",
    Connection: "connection",
    Call: "call",
    Disconnected: "disconnected",
    Error: "error",
};

const PeerErrorType = {
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
};

const SerializationType = {
    Binary: "binary",
    BinaryUTF8: "binary-utf8",
    JSON: "json",
};

const SocketEventType = {
    Message: "message",
    Disconnected: "disconnected",
    Error: "error",
    Close: "close",
};

const ServerMessageType = {
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
};

export {
    ConnectionEventType,
    ConnectionType,
    PeerEventType,
    PeerErrorType,
    SerializationType,
    SocketEventType,
    ServerMessageType,
};
