setInterval(function() {
  // Add a new connection
  var newConnection = {give: "austin", get: "get" + Math.floor(Math.random() * numGetters)};
  viz.set("peers." + newConnection.get + ".connected", true);
  connections.push(newConnection);

  // Remove an existing connection
  if (connections.length > 10) {
    allRemoved = connections.splice(Math.floor(Math.random() * connections.length), 1);
    removed = allRemoved[0];
    viz.set("peers." + removed.get + ".connected", false);
  }
  
}, 25)