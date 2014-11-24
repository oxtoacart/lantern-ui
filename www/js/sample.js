var cnMinLat = 30,
    cnMaxLat = 45,
    cnMinLon = 75,
    cnMaxLon = 120,
    numGetters = 100;

// Sample peers
var givePeers = {
  "austin": {
    lat: 30.25,
    lon: -97.75,
    mode: "give",
    connected: true,
  },
};

var getPeers = {},
    peers = {};

for (var i=0; i<numGetters; i++) {
  peer = {
    lat: cnMinLat + Math.random() * (cnMaxLat - cnMinLat),
    lon: cnMinLon + Math.random() * (cnMaxLon - cnMinLon),
    mode: "get",
    connected: false,
  }
  id = "get" + i;
  getPeers[id] = peer;
  peers[id] = peer;
}

for (key in givePeers) {
  peers[key] = givePeers[key];
}

// connections get populated in simulate.js
var connections = [];