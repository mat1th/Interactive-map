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
    var selector = function (selector) {
            return document.querySelector(selector);
        },
        selectors = function (selector) {
            return document.querySelectorAll(selector);
        };
//        SvgMapPart = selector('object svg').contentDocument;
//    console.log(SvgMapPart)


    //subscribe to trashesCollection
    Meteor.subscribe('trashesCollection', function () {
        var trashesData = trashesCollection.find().fetch();
        //callback to setTrashes
        setTrashes(trashesData)
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

    //create div icon with class trash
    var trashIcon = L.divIcon({
        className: 'trash'
    });

    //disable dragging
    map.dragging.disable();
    map.touchZoom.disable();
    map.doubleClickZoom.disable();
    map.scrollWheelZoom.disable();
    map.boxZoom.disable();
    map.keyboard.disable();

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
        "fillColor": "#F0F0F0",
        "fillOpacity": 1,
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
        var div = document.createElement("div");
        layer.setStyle({
            fillColor: '#000000',
            dashArray: '',
            fillOpacity: 0.7
        });

        if (!L.Browser.ie && !L.Browser.opera) {
            layer.bringToFront();
        };

        layerName = layer.feature.properties.name;

        div.innerHTML = layerName;

        document.body.appendChild(div);

        console.log(div)


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
