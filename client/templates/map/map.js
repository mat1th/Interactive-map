// on startup run resizing event
Meteor.startup(function () {
    $(window).resize(function () {
        $('#map').css('height', window.innerHeight - 82 - 45);
    });
    $(window).resize(); // trigger resize event
});

// create marker collection
var Markers = new Meteor.Collection('markers');
Meteor.subscribe('markers');

//create data collection
var data = new Meteor.Collection('data');
Meteor.subscribe('data');

//if template "map" is renderd
Template.map.rendered = function () {
    //url to images for map
    L.Icon.Default.imagePath = 'packages/bevanhunt_leaflet/images';


    var baseLayer = L.tileLayer(
  'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{
    attribution: '...',
    maxZoom: 18
  }
);

    //heatmap
    var testData = {
        max: 8,
        data: [{
            lat: 24.6408,
            lng: 46.7728,
            count: 3
        }, {
            lat: 50.75,
            lng: -1.55,
            count: 1
        }]
    };

    var cfg = {
        // radius should be small ONLY if scaleRadius is true (or small radius is intended)
        // if scaleRadius is false it will be the constant radius used in pixels
        "radius": 2,
        "maxOpacity": .8,
        // scales the radius based on map zoom
        "scaleRadius": true,
        // if set to false the heatmap uses the global maximum for colorization
        // if activated: uses the data maximum within the current map boundaries
        //   (there will always be a red spot with useLocalExtremas true)
        "useLocalExtrema": true,
        // which field name in your data represents the latitude - default "lat"
        latField: 'lat',
        // which field name in your data represents the longitude - default "lng"
        lngField: 'lng',
        // which field name in your data represents the data value - default "value"
        valueField: 'count'
    };

    var heatmapLayer = new HeatmapOverlay(cfg);

 var map = new L.Map('map-canvas', {
  center: new L.LatLng(25.6586, -80.3568),
  zoom: 4,
  layers: [baseLayer, heatmapLayer]
});

    heatmapLayer.setData(testData);




    //create leaflet map and start coordiates
//    var map = L.map('map', {
//        layers: [heatmapLayer],
//    }).setView([52.3547, 4.904], 13);

    //map sort
    L.tileLayer.provider('Thunderforest.Transport').addTo(map);

    //if dubble click create a marker
    map.on('dblclick', function (event) {
        Markers.insert({
            latlng: event.latlng
        });
    });

    //add compass
    map.addControl(new L.Control.Compass());
    //add current location icon

    //create style of a marker
    var markerStyle = {
        radius: 25,
        weight: 4,
        borderColor: "rgba(0, 170, 255, 0.7)",
        color: '#00AAFF',
        fill: true
    };

    //add marker to map
    map.addControl(new L.Control.Gps({
        style: markerStyle
    }));

    var query = Markers.find();
    query.observe({
        added: function (document) {
            var marker = L.marker(document.latlng).addTo(map)
                .on('click', function (event) {
                    map.removeLayer(marker);
                    Markers.remove({
                        _id: document._id
                    });
                });
        },
        removed: function (oldDocument) {
            layers = map._layers;
            var key, val;
            for (key in layers) {
                val = layers[key];
                if (val._latlng) {
                    if (val._latlng.lat === oldDocument.latlng.lat && val._latlng.lng === oldDocument.latlng.lng) {
                        map.removeLayer(val);
                    }
                }
            }
        }
    });
};
