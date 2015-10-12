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
  'http://{s}.tile.openstreetmap.se/hydda/base/{z}/{x}/{y}.png',{
    attribution: '...',
    maxZoom: 18
  }
);
    //create leaflet map and start coordiates
    var map = L.map('map', {
    }).setView([52.3547, 4.904], 13);

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
//
//    var query = Markers.find();
//    query.observe({
//        added: function (document) {
//            var marker = L.marker(document.latlng).addTo(map)
//                .on('click', function (event) {
//                    map.removeLayer(marker);
//                    Markers.remove({
//                        _id: document._id
//                    });
//                });
//        },
//        removed: function (oldDocument) {
//            layers = map._layers;
//            var key, val;
//            for (key in layers) {
//                val = layers[key];
//                if (val._latlng) {
//                    if (val._latlng.lat === oldDocument.latlng.lat && val._latlng.lng === oldDocument.latlng.lng) {
//                        map.removeLayer(val);
//                    }
//                }
//            }
//        }
//    });
};
