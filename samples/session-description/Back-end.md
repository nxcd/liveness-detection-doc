# Back-end

- [offer](#offer)
- [answer](#answer)

You can see the full code [here](src/client.js)
## offer

The read-only property RTCPeerConnection.localDescription returns an RTCSessionDescription describing the session for the local end of the connection. If it has not yet been set, this is null

``` js
var offer = pc.localDescription
document.getElementById('offer-sdp').textContent = offer.sdp
```
## answer

``` js
// [...]
return fetch('/offer', {
     //[...]
    }).then(function (response) {
        return response.json()
    }).then(function (answer) {
        document.getElementById('answer-sdp').textContent = answer.sdp
        return pc.setRemoteDescription(answer)
    }).catch(function (e) {
```