// on startup run resizing event
Meteor.startup(function () {
    $(window).resize(function () {
        $('#map').css('height', window.innerHeight);
    });
    $(window).resize(); // trigger resize event
});

// create marker collection
var Markers = new Meteor.Collection('markers');
Meteor.subscribe("markers");

//if template "map" is renderd
Template.map.rendered = function () {

    //create data collection
    var trashesCollection = new Meteor.Collection('trashesCollection');
    Meteor.subscribe('trashesCollection', function () {
        var trashesData = trashesCollection.find().fetch();
        setTrashes(trashesData)
    });

    var setTrashes = function (trashesData) {
        var amountTrashes = trashesData.length,
            i = 0;
        console.log(trashesData)
        for (i; i < amountTrashes; i++) {
            var longitude = trashesData[i].log;
            var latitude = trashesData[i].lat;
            var street = trashesData[i].street;

            L.marker([latitude, longitude], {
                icon: full
            }).addTo(map).bindPopup(street);
        }
    };

    //url to images for map
    var baseLayer = L.tileLayer(
        'http://{s}.tile.openstreetmap.se/hydda/base/{z}/{x}/{y}.png', {
            attribution: 'Informotion ',
            maxZoom: 16,
            minZoom: 13
        });

    //map sort
    //create leaflet map and start coordiates
    var map = L.map('map', {
        center: [52.376956, 4.902756],
        zoom: 14,
        opacity: 0,
        layers: [baseLayer]
    });
    L.tileLayer.provider('Hydda.Base').addTo(map);

    var trashIcon = L.Icon.extend({
        options: {
            iconSize: [20, 50],
            shadowSize: [50, 64],
            iconAnchor: [22, 94],
            shadowAnchor: [4, 62],
            popupAnchor: [-3, -76]
        }
    });

    var full = new trashIcon({
            iconUrl: 'icons/trash.svg'
        }),
        halfFull = new trashIcon({
            iconUrl: 'icons/trash.svg'
        }),
        empty = new trashIcon({
            iconUrl: 'icons/trash.svg'
        });

    //    var trash = L.layerGroup([twee, drie]);
    //    var trashFull = L.layerGroup([een, drie]);

    //add compass
    map.addControl(new L.Control.Compass());
    //
    //    var overlayMaps = {
    //        "trash": trash,
    //        "trashFull": trashFull
    //    };

    //    L.control.layers(overlayMaps).addTo(map);


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
