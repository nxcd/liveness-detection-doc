# Back-end

After created the ['front-end'](Front-end.md) you need write a js client to get the video stream, send to the server and receive a response back, so, just do it!

You can find the final implementation ['here'](src/client.js)

Index:
in your `client.js` we will
- [PeerConnection](#PeerConnection)
- [Initialize the peer conection](#Initialize-the-peer-conection)
  - [links](#links[1])
- [Get webcam video](#Get-webcam-video)
  - [links](#links[2])



## PeerConnection
in our `client.js` we'll have a functions that create a ['RTCPeerConnection'](https://developer.mozilla.org/pt-BR/docs/Web/API/RTCPeerConnection)


``` js
function createPeerConnection () {

  var pc = new RTCPeerConnection()

  // receive video
  pc.addEventListener('track', function (evt) {
    document.getElementById('video').srcObject = evt.streams[0]
  })

  return pc
}
```

## Initialize the peer conection
After we click on play, we will abble the video tag and start send the video stream to the server.

``` js
// get DOM element
var dataChannelLog = document.getElementById('data-channel')

// The start method start all the stream process
function start () {
  // hide our video  
  document.getElementById('start').style.display = 'none'
  
  // create our PeerConnection with the previus step
  pc = createPeerConnection()

  // with the RTCPeerConnection we can create a channel to comunicte with the server by text.
  // You can read more about in ###links topic in this document
  dc = pc.createDataChannel(null, { ordered: true })
  
  // When the connection get close, we'll do something
  dc.onclose = function () {
    clearInterval(dcInterval)
    dataChannelLog.textContent += '> Closed\n'
  }

  // When the connection get open, we'll do something
  dc.onopen = function () {
    // set text to data-channel element
    dcInterval = setInterval(function () {
      dataChannelLog.textContent = 'Opened ping ' + new Date().getTime().toString()

      // send a ping message each 100ms
      dc.send(dataChannelLog.textContent)
    }, 100)
  }
  
  // When the server send a ping response, we'll print it in data-channel element
  dc.onmessage = function (evt) {
    // evt.data is a unformatted JSON, so we use the 
    // JSON.stringify(JSON.parse(...)) to format this JSON 
    // before print it on screen
    var unformattedJson = JSON.parse(evt.data)
    var beautJson = JSON.stringify(unformattedJson, null, 2)
    dataChannelLog.textContent = beautJson
  }

  // [...]
```

### links[1]
- ['pc.createDataChannel(...)'](https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/createDataChannel)

## Get webcam video

``` js
// [...]
  // show our video
  document.getElementById('media').style.display = 'block'
  
  // here we are asking for browser to open the user media and get only video stream.
  navigator.mediaDevices.getUserMedia({
    audio: false,
    video: true
  }).then(function (stream) {
    // Then we will receive the stream and we can do anything
    // with this, in our case we'll add the frames to our 
    // peerConnection, if you want, you can show the original 
    // video to the user with a canvas, so send it too to the server
    stream.getTracks().forEach(function (track) {
      pc.addTrack(track, stream)
    })
    // negotiate() will be explaned posteriorly
    return negotiate()
  }, function (err) {}  
    alert('Could not acquire media: ' + err)
  })
  
  // When the video is showed, we show the stop button too
  document.getElementById('stop').style.display = 'inline-block'
}
```

### links[2]
- [navigator.mediaDevices.getUserMedia(...)](https://developer.mozilla.org/pt-PT/docs/Web/API/MediaDevices/obterMultimediaUtilizador)


## negotiate()
Before we start, here has some important concepts

*[SDP](https://developer.mozilla.org/en-US/docs/Glossary/SDP)*: (Session Description Protocol) is the standard describing a peer-to-peer connection. SDP contains the codec, source address, and timing information of audio and video.

*[ICE](https://developer.mozilla.org/en-US/docs/Glossary/ICE)*:  (Interactive Connectivity Establishment) is a framework used by WebRTC (among other technologies) for connecting two peers to each other, regardless of network topology (usually for audio and/or video chat). This protocol lets two peers find and establish a connection with one another even though they may both be using Network Address Translator (NAT) to share a global IP address with other devices on their respective local networks.

``` js
function negotiate () {
  /* The createOffer() method of the RTCPeerConnection interface initiates the creation of an SDP* offer for the purpose of starting a new WebRTC connection to a remote peer. The SDP offer includes information about any MediaStreamTracks already attached to the WebRTC session, codec, and options supported by the browser, and any candidates already gathered by the ICE agent, for the purpose of being sent over the signaling channel to a potential peer to request a connection or to update the configuration of an existing connection. */

  // The return value is a Promise which, when the offer has been created, is resolved with a RTCSessionDescription object containing the newly-created offer.
  
  // The RTCSessionDescription interface describes one end of a connection—or potential connection—and how it's configured. Each RTCSessionDescription consists of a description type indicating which part of the offer/answer negotiation process it describes and of the SDP descriptor of the session.
  return pc.createOffer().then(function (offer) {
    return pc.setLocalDescription(offer)
  }).then(function () {
    /* The RTCIceGatheringState enum defines string constants which reflect the current status of ICE gathering.
     values: 

     - "new":	The peer connection was just created and hasn't done any networking yet.
     
     - "gathering":	The ICE agent is in the process of gathering candidates for the connection.
     
     - "complete":	The ICE agent has finished gathering candidates. If something happens that requires collecting new candidates, such as a new interface being added or the addition of a new ICE server, the state will revert to "gathering" to gather those candidates.*/

     
    return new Promise(function (resolve) {
      if (pc.iceGatheringState === 'complete') {
        resolve()
      } else {
        function checkState () {
          if (pc.iceGatheringState === 'complete') {
            pc.removeEventListener('icegatheringstatechange', checkState)
            resolve()
          }
        }
        pc.addEventListener('icegatheringstatechange', checkState)
      }
    })
  }).then(function () {
    // The read-only property RTCPeerConnection.localDescription returns an RTCSessionDescription describing the session for the local end of the connection. If it has not yet been set, this is null. 
    
    var offer = pc.localDescription

    // finaly we send our data to server
    return fetch('{nextcode.url.com}/offer', {
      body: JSON.stringify({
        sdp: offer.sdp,
        type: offer.type,
        video_transform: 'none'
      }),
      headers: {
        'Content-Type': 'application/json'
      },
      method: 'POST'
    })
  }).then(function (response) {
    return response.json()
  }).then(function (answer) {
    // The RTCPeerConnection.setRemoteDescription() method changes the remote description associated with the connection. This description specifies the properties of the remote end of the connection, including the media format. The method takes a single parameter—the session description—and it returns a Promise which is fulfilled once the description has been changed, asynchronously.

    // This is typically called after receiving an offer or answer from another peer over the signaling server. Keep in mind that if setRemoteDescription() is called while a connection is already in place, it means renegotiation is underway (possibly to adapt to changing network conditions). Because descriptions will be exchanged until the two peers agree on a configuration, the description submitted by calling setRemoteDescription() does not immediately take effect. Instead, the current connection configuration remains in place until negotiation is complete. Only then does the agreed-upon configuration take effect.
    return pc.setRemoteDescription(answer)
  }).catch(function (e) {
    alert(e)
  })
}
```

### Stop

``` js
function stop () {
  document.getElementById('stop').style.display = 'none'

  // close data channel
  if (dc) {
    dc.close()
  }

  // close transceivers
  //The WebRTC interface RTCRtpTransceiver describes a permanent pairing of an RTCRtpSender and an RTCRtpReceiver, along with some shared state.

  //Each SDP media section describes one bidirectional SRTP ("Secure Real Time Protocol") stream (excepting the media section for RTCDataChannel, if present). This pairing of send and receive SRTP streams is significant for some applications, so RTCRtpTransceiver is used to represent this pairing, along with other important state from the media section. Each non-disabled SRTP media section is always represented by exactly one transceiver.

  //A transceiver is uniquely identified using its mid property, which is the same as the media ID (mid) of its corresponding m-line. An RTCRtpTransceiver is associated with an m-line if its mid is non-null; otherwise it's considered disassociated.
  if (pc.getTransceivers) {
    pc.getTransceivers().forEach(function (transceiver) {
      if (transceiver.stop) {
        transceiver.stop()
      }
    })
  }

  // close local audio / video

  // The RTCPeerConnection method getSenders() returns an array of RTCRtpSender objects, each of which represents the RTP sender responsible for transmitting one track's data. 
  pc.getSenders().forEach(function (sender) {
    sender.track.stop()
  })
}
```

