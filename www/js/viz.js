var locale = en_US;

function i18n(key) {
  return locale[key];
}

var countries = {};
topojson.object(world, world.objects.countries).geometries.forEach(function(country) {
  if (country.alpha2) {
    countries[country.alpha2] = country;
  }
});

var projection = d3.geo.mercator();
var pointRadius = 5;

var viz = new Ractive({
  // The `el` option can be a node, an ID, or a CSS selector.
  el: 'vis-container',

  // We could pass in a string, but for the sake of convenience
  // we're passing the ID of the <script> tag above.
  template: '#vistmpl',

  data: {
    // Paths for countries on map
    countries: countries,
    peers: peers,
    // Render paths using a Mercator projection
    geopath: d3.geo.path().projection(projection),
    // Render points using a Mercator projection. We use a different path for
    // points because we adjust this path on zooming.
    pointpath: d3.geo.path().projection(projection).pointRadius(pointRadius),
    i18n: i18n,
    translateX: 0,
    translateY: 0,
    scale: 1,
    zoom: 1,
    connections: connections,
    cpath: cpath,
    updatesPerSecond: 0,
  }
});

function cpath(give, get) {
  try {
    var MINIMUM_PEER_DISTANCE_FOR_NORMAL_ARCS = 30;
      
    var pGive = projection([give.lon, give.lat]),
        pGet = projection([get.lon, get.lat]),
        xS = pGive[0], yS = pGive[1], xP = pGet[0], yP = pGet[1];
    
    var distanceBetweenPeers = Math.sqrt(Math.pow(xS - xP, 2) + Math.pow(yS - yP, 2));
    var xL, xR, yL, yR;
    
    if (distanceBetweenPeers < MINIMUM_PEER_DISTANCE_FOR_NORMAL_ARCS) {
      // Peer and self are very close, draw a loopy arc
      // Make sure that the arc's line doesn't cross itself by ordering the
      // peers from left to right
      if (xS < xP) {
        xL = xS;
        yL = yS;
        xR = xP;
        yR = yP;
      } else {
        xL = xP;
        yL = yP;
        xR = xS;
        yR = yS;
      }
      var xC1 = Math.min(xL, xR) - MINIMUM_PEER_DISTANCE_FOR_NORMAL_ARCS * 2 / 3;
      var xC2 = Math.max(xL, xR) + MINIMUM_PEER_DISTANCE_FOR_NORMAL_ARCS * 2 / 3;
      var yC = Math.max(yL, yR) + MINIMUM_PEER_DISTANCE_FOR_NORMAL_ARCS;
      return 'M'+xL+','+yL+' C '+xC1+','+yC+' '+xC2+','+yC+' '+xR+','+yR;
    } else {
      // Peer and self are at different positions, draw arc between them
      var controlPoint = [Math.abs(xS+xP)/2, Math.min(yS, yP) - Math.abs(xP-xS)*0.3],
          xC = controlPoint[0], yC = controlPoint[1];
      return 'M'+xP+','+yP+' Q '+xC+','+yC+' '+xS+','+yS;
    }
  } catch (err) {
    console.log(err);
  }
}
/*******************************************************************************
 * Scroll Wheel (Zoom) Handling
 ******************************************************************************/
var zoom = d3.behavior.zoom().scaleExtent([1, 25]).on("zoom", zoomed);

function zoomed() {
  // Translate based on zoom/pan
  viz.set("translateX", d3.event.translate[0]);
  viz.set("translateY", d3.event.translate[1]);
  // Zoom based on zoom
  viz.set("zoom", d3.event.scale);
  // Resize points so that they maintain a constant absolute size irrespective
  // of zoom level.
  viz.set("pointpath", d3.geo.path().projection(d3.geo.mercator()).pointRadius(pointRadius / d3.event.scale));
}

d3.select("#map").call(zoom);

/*******************************************************************************
 * Window Resize Handling
 ******************************************************************************/
var w = $(window),
    initWidth = w.innerWidth(),
    initHeight = w.innerHeight();

function scaleSVG() {
  var width = w.innerWidth(),
      height = w.innerHeight(),
      scaleX = width / initWidth,
      scaleY = height / initHeight,
      scale = Math.min(scaleX, scaleY);

  viz.set("scale", scale);
}

window.onresize = function() {
  var width = w.innerWidth();
  var height = w.innerHeight();
  var scaleX = width / initWidth;
  var scaleY = height / initHeight;
  windowScale = Math.min(scaleX, scaleY);
  scaleSVG();
};