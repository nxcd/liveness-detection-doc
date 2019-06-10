# Monitoring ICE

## What's ICE

ICE (Interactive Connectivity Establishment) is a framework used by WebRTC (among other technologies) for connecting two peers to each other, regardless of network topology (usually for audio and/or video chat). This protocol lets two peers find and establish a connection with one another even though they may both be using Network Address Translator (NAT) to share a global IP address with other devices on their respective local networks.

The framework algorithm looks for the lowest-latency path for connecting the two peers, trying these options in order:

Direct UDP connection (In this case—and only this case—a STUN server is used to find out the network-facing address of a peer
Direct TCP connection, via the HTTP port
Direct TCP connection, via the HTTPS port
Indirect connection via a relay/TURN server (if a direct connection fails, e.g. if one peer is behind a firewall that blocks NAT traversal)

Font: https://developer.mozilla.org/en-US/docs/Glossary/ICE

## Signaling state

The read-only signalingState property on the RTCPeerConnection interface returns one of the string values specified by the RTCSignalingState enum; these values describe the state of the signaling process on the local end of the connection while connecting or reconnecting to another peer. See Signaling in Lifetime of a WebRTC session for more details about the signaling process.

Because the signaling process is a state machine, being able to verify that your code is in the expected state when messages arrive can help avoid unexpected and avoidable failures. For example, if you receive an answer while the signalingState isn't "have-local-offer", you know that something is wrong, since you should only receive answers after creating an offer but before an answer has been received and passed into RTCPeerConnection.setLocalDescription(). Your code will be more reliable if you watch for mismatched states like this and handle them gracefully.

Font: https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/signalingState