// on startup run resizing event
Meteor.startup(function () {
    $(window).resize(function () {
        $('#map').css('height', window.innerHeight);
    });
    $(window).resize(); // trigger resize event
});

//create Collections
var trashesCollection = new Meteor.Collection('trashesCollection');
var fotoLocationsCollection = new Meteor.Collection('fotoLocationsCollection');
var fotoLocationsJulyCollection = new Meteor.Collection('fotoLocationsJulyCollection');
var fotoLocationsAugustCollection = new Meteor.Collection('fotoLocationsAugustCollection');

//if template "map" is renderd
Template.map.rendered = function () {
    var selector = function (selector) {
            return document.querySelector(selector);
        },
        selectors = function (selector) {
            return document.querySelectorAll(selector);
        };

    //subscribe to trashesCollection
    Meteor.subscribe('trashesCollection', function () {
        var trashesData = trashesCollection.find().fetch();
        //callback to setTrashes
        setTrashes(trashesData)
    });

    //subscribe to fotoLocationsCollection
    Meteor.subscribe('fotoLocationsCollection', function () {
        var fotosData = fotoLocationsCollection.find().fetch();
        setFotoLocation(fotosData);
    });
    Meteor.subscribe('fotoLocationsJulyCollection', function () {
        var fotosData = fotoLocationsJulyCollection.find().fetch();
        setFotoLocationJuly(fotosData);
    });
    Meteor.subscribe('fotoLocationsAugustCollection', function () {
        var fotosData = fotoLocationsAugustCollection.find().fetch();
        setFotoLocationAugust(fotosData);
    });

    HTTP.get(Meteor.absoluteUrl("/map.json"), function (err, result) {        
        var geoData = result.data;
        geoDatafunction(geoData);
    });


    //create leaflet map and start coordiates
    var map = L.map('map', {
        center: [52.376956, 4.902756],
        maxZoom: 14,
        minZoom: 14,
        zoom: 14,
        zoomControl: false,
        attributionControl: false
    });

    //add bounds to map
    map.fitBounds([
    [52.380419542018174, 4.941530227661133],
     [52.359457601988254, 4.864282608032227]
   ]);

    var baseLayer = L.tileLayer(
        'http://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}.png', {
            attribution: 'Informotion',
            subdomains: 'abcd',
            maxZoom: 19
        });

    L.tileLayer.provider('CartoDB.PositronNoLabels').addTo(map);

    //create div icon with class trash
    var trashIcon = L.divIcon({
        className: 'trashicon'
    });

    var fotoIcon = L.divIcon({
        className: 'fotoicon'
    });
     var fotoIconJuly = L.divIcon({
        className: 'foto-icon-july'
    });
     var fotoIconAugust = L.divIcon({
        className: 'foto-icon-august'
    });

    //disable dragging
    map.dragging.disable();
    map.touchZoom.disable();
    map.doubleClickZoom.disable();
    map.scrollWheelZoom.disable();
    map.boxZoom.disable();
    map.keyboard.disable();


    //set foto's on map
        var setFotoLocation = function (fotosData) {
            var Amountfotos = fotosData.length,
                f = 0;
            for (f; f < Amountfotos; f++) {
                var longitude = fotosData[f].log;
                var latitude = fotosData[f].lat;
                L.marker([latitude, longitude], {
                    icon: fotoIcon,
                    riseOnHover: true,
                }).addTo(map);
            }
        };
//    //set foto's july on map
//    var setFotoLocationJuly = function (fotosData) {
//        var Amountfotos = fotosData.length,
//            f = 0;
//        for (f; f < Amountfotos; f++) {
//            var longitude = fotosData[f].log;
//            var latitude = fotosData[f].lat;
//            L.marker([latitude, longitude], {
//                icon: fotoIconJuly,
//                riseOnHover: true,
//            }).addTo(map);
//        }
//    };
//    var setFotoLocationAugust = function (fotosData) {
//        var Amountfotos = fotosData.length,
//            f = 0;
//        for (f; f < Amountfotos; f++) {
//            var longitude = fotosData[f].log;
//            var latitude = fotosData[f].lat;
//            L.marker([latitude, longitude], {
//                icon: fotoIconAugust,
//                riseOnHover: true,
//            }).addTo(map);
//        }
//    };

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

    //Create the map of Amsterdam Centrum and add render it.
    var myStyle = {
        "fillColor": "#000",
        "fillOpacity": 0.5,
        "color": "#FFFFFF"
    }
    var geojson;

    //What happens on mouseover
    function highlightFeature(e) {
        var layer = e.target;
        layer.setStyle({
            weight: 5,
            fillColor: '#D83E41',
            dashArray: '',
            fillOpacity: 0.7
        });

        if (!L.Browser.ie && !L.Browser.opera) {
            layer.bringToFront();
        };
    };

    //reset on mouseout
    function resetHighlight(e) {
        geojson.resetStyle(e.target);
    };

    function clickFeature(e) {
        var layer = e.target;
        SvgMapPart = selector('.namediv')
        console.log(SvgMapPart);
        SvgMapPart.innerHTML = layer.feature.properties.name;

        var xPosition = event.clientX;
        var yPosition = event.clientY;

        SvgMapPart.style.position = "absolute";
        SvgMapPart.style.left = xPosition + 'px';
        SvgMapPart.style.top = yPosition + -20 + 'px';

        console.log(layer.feature.properties.name);
    };

    function onEachFeature(feature, layer) {
        layer.on({
            mouseover: highlightFeature,
            mouseout: resetHighlight,
            click: clickFeature
        });
    };

    var geoDatafunction = function (geoData) {
        geojson = L.geoJson(geoData, {
            style: myStyle,
            onEachFeature: onEachFeature
        }).addTo(map)   
    };

};
