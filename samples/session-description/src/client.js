// get DOM elements
var dataChannelLog = document.getElementById('data-channel')

// peer connection
var pc = null

// data channel
var dc = null 
var dcInterval = null

function createPeerConnection () {
  var pc = new RTCPeerConnection()

  pc.addEventListener('track', function (evt) {
    document.getElementById('video').srcObject = evt.streams[0]
  })

  return pc
}

function negotiate () {
  return pc.createOffer().then(function (offer) {
    return pc.setLocalDescription(offer)
  }).then(function () {
    // wait for ICE gathering to complete
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
    var offer = pc.localDescription
    document.getElementById('offer-sdp').textContent = offer.sdp
    return fetch('https://liveness.nxcd.app/offer', {
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
    document.getElementById('answer-sdp').textContent = answer.sdp
    return pc.setRemoteDescription(answer)
  }).catch(function (e) {
    alert(e)
  })
}

function start () {
  document.getElementById('start').style.display = 'none'

  pc = createPeerConnection()

  dc = pc.createDataChannel(null, { ordered: true })

  dc.onclose = function () {
    clearInterval(dcInterval)
    dataChannelLog.textContent += '> Closed\n'
  }

  dc.onopen = function () {
    dataChannelLog.textContent += '> Opened\n'
    dcInterval = setInterval(function () {
      dataChannelLog.textContent = 'ping ' + new Date().getTime().toString()

      dc.send(dataChannelLog.textContent)
    }, 100)
  }

  dc.onmessage = function (evt) {
    var unformattedJson = JSON.parse(evt.data)
    var beautJson = JSON.stringify(unformattedJson, null, 2)
    dataChannelLog.textContent = beautJson
  }

  document.getElementById('media').style.display = 'block'

  navigator.mediaDevices.getUserMedia({
    audio: false,
    video: true
  }).then(function (stream) {
    stream.getTracks().forEach(function (track) {
      pc.addTrack(track, stream)
    })
    return negotiate()
  }, function (err) {
    alert('Could not acquire media: ' + err)
  })

  document.getElementById('stop').style.display = 'inline-block'
}

function stop () {
  document.getElementById('stop').style.display = 'none'

  // close data channel
  if (dc) {
    dc.close()
  }

  // close transceivers
  if (pc.getTransceivers) {
    pc.getTransceivers().forEach(function (transceiver) {
      if (transceiver.stop) {
        transceiver.stop()
      }
    })
  }

  // close local audio / video
  pc.getSenders().forEach(function (sender) {
    sender.track.stop()
  })
}
