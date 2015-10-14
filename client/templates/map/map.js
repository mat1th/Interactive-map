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

//create trashesCollection
var trashesCollection = new Meteor.Collection('trashesCollection');

//if template "map" is renderd
Template.map.rendered = function () {
    //subscribe to trashesCollection
    Meteor.subscribe('trashesCollection', function () {
        var trashesData = trashesCollection.find().fetch();
        //callback to setTrashes
        setTrashes(trashesData)
    });

    //url to images for map
    var baseLayer = L.tileLayer(
        'http://{s}.tile.openstreetmap.se/hydda/base/{z}/{x}/{y}.png', {
            attribution: 'Informotion',
            maxZoom: 14,
            minZoom: 14
        });
    //create leaflet map and start coordiates
    var map = L.map('map', {
        center: [52.376956, 4.902756],
        maxZoom: 15,
        minZoom: 15,
        zoom: 15,
        layers: [baseLayer]
    });
    L.tileLayer.provider('Hydda.Base').addTo(map);
    //add bounds to map
    map.fitBounds([
     [52.359457601988254, 4.864282608032227],
    [52.380419542018174, 4.941530227661133]]);

    //create div icon with class trash
    var trashIcon = L.divIcon({
        className: 'trash'
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

    //add current marker to map
    map.addControl(new L.Control.Gps({
        style: markerStyle
    }));

    //set trashes on map
    var setTrashes = function (trashesData) {
        var amountTrashes = trashesData.length,
            i = 0;
        for (i; i < amountTrashes; i++) {
            var longitude = trashesData[i].log;
            var latitude = trashesData[i].lat;
            var street = trashesData[i].street;
            var number = trashesData[i].houseNumber;
            L.marker([latitude, longitude], {
                icon: trashIcon,
                riseOnHover: true,
            }).addTo(map).bindPopup(street + number);
        }
    };

    //create layers
    //    var trash = L.layerGroup([twee, drie]);
    //    var trashFull = L.layerGroup([een, drie]);

    //    var overlayMaps = {
    //        "trash": trash,
    //        "trashFull": trashFull
    //    };

    //    L.control.layers(overlayMaps).addTo(map);

};
