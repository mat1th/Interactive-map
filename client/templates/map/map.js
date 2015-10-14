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

    //create leaflet map and start coordiates
    var map = L.map('map', {
        center: [52.376956, 4.902756],
        maxZoom: 14,
        minZoom: 14,
        zoom: 14
//        layers: [baseLayer]
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
};
