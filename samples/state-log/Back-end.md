# Back-end

- [logging ICE](#logging-ICE)
    - [icegatheringstatechange](#icegatheringstatechange)
    - [iceconnectionstatechange](#icegatheringstatechange)
    - [signalingstatechange](#signalingstatechange)

You can see the full code [here](src/client.js)
## logging ICE

In fisrt line we need get the elements that we'll update with the ICE state

``` js
var iceConnectionLog = document.getElementById('ice-connection-state')
var iceGatheringLog = document.getElementById('ice-gathering-state')
var signalingLog = document.getElementById('signaling-state')
```

After instacieate the RTCPeerConnection interface we add some listeners to get the ICE state updates 


``` js
    var pc = new RTCPeerConnection()

    // register some listeners to help debugging
    pc.addEventListener('icegatheringstatechange', function () {
        iceGatheringLog.textContent += ' -> ' + pc.iceGatheringState
    }, false)
    iceGatheringLog.textContent = pc.iceGatheringState

    pc.addEventListener('iceconnectionstatechange', function () {
        iceConnectionLog.textContent += ' -> ' + pc.iceConnectionState
    }, false)
    iceConnectionLog.textContent = pc.iceConnectionState

    pc.addEventListener('signalingstatechange', function () {
    signalingLog.textContent += ' -> ' + pc.signalingState
    }, false)
    signalingLog.textContent = pc.signalingState
```

### icegatheringstatechange
The icegatheringstatechange event is sent to the onicegatheringstatechange event handler on an RTCPeerConnection when the state of the ICE candidate gathering process changes. This signifies that the value of the connection's iceGatheringState property has changed.

States:
- new
- complete
- gathering

### iceconnectionstatechange
An iceconnectionstatechange event is sent to an RTCPeerConnection object each time the ICE connection state changes during the negotiation process. The new ICE connection state is available in the object's iceConnectionState} property.

States:
- connected
- disconnected

### signalingstatechange

The onsignalingstatechange property of the RTCPeerConnection interface is an EventHandler which specifies a function to be called when the signalingstatechange event occurs on an RTCPeerConnection interface. The function receives as input the event object, of type Event; this event is sent when the value of RTCPeerConnection.signalingState changes, as the result of a call to either setLocalDescription() or setRemoteDescription().

States:
- stable
- have-local-offer
- have-remote-offer
- have-local-pranswer
- have-remote-pranswer
