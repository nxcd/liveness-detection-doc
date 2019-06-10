# Frond-end

It isn't a hard impementation, actually the this font-end is so easy

You can find the final implementation ['here'](src/index.html)

Index:
Inside your <body> you we'll create page with:

- ['Start/stop button'](#start/stop-button)
- ['Get user media (webcam video)'](#get-user-media)
- ['Print data channel response'](#data-channels)

## Start/stop-button
``` html
<button id="start" onclick="start()">Start</button>
<button id="stop" style="display: none" onclick="stop()">Stop</button>
```

## Get-user-media
After we click on play, we will abble the video tag and start send the video stream to the server.
``` html
<div id="media" style="display: none; height: 400px; width: 400px;">
    <h2>Media</h2>
    <video id="video" autoplay="true"></video>
</div>
```

## Data-channels
When we send the video stream to the server, we will receive a response that we it print here.
``` html
<div>
    <h2>Data channel</h2>
    <pre id="data-channel" style="height: 400px;"></pre>
</div>
```
