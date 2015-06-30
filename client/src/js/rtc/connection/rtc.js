/**
 * Loader for the WebRTC objects necessary to initiate the connection.
 */

/* istanbul ignore next */
var RTCPeerConnection = window.RTCPeerConnection ||
    window.mozRTCPeerConnection ||
    window.webkitRTCPeerConnection ||
    window.msRTCPeerConnection;

/* istanbul ignore next */
var RTCSessionDescription = window.RTCSessionDescription ||
    window.mozRTCSessionDescription ||
    window.webkitRTCSessionDescription ||
    window.msRTCSessionDescription;

export {
    RTCPeerConnection as PeerConnection,
    RTCSessionDescription as SessionDescription
};
