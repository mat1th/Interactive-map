// on startup run resizing event
Meteor.startup(function () {
    //    $(window).resize(function () {
    //        $('#map').css('height', window.innerHeight);
    //    });
    //    $(window).resize(); // trigger resize event
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

    var toggleFilterImg = selector('.togglefilterimg'),
        toggleFilter = selector('.togglefilter'),
        filter = selector('.filter'),
        informotion = selector('.informotion'),
        crowdedness = selector('.crowdedness'),
        trashes = selector('.trashes'),
        cleaningIntensity = selector('.cleaning-intensity'),
        wijken = selector('.wijken'),
        wijkenP = selector('.wijken p');

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

    var layerNames = [];        
    HTTP.get(Meteor.absoluteUrl("/map.json"), function (err, result) {                
        geoData = result.data;                
        var gData = geoData.features;        
        var i = 0;        
        for (i; i < gData.length; i++) {            
            layerNames.push(gData[i].properties.name);        
        };                
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

    var latlngs = [
        [52.38825151349544, 4.890117645263672, "1"],
        [52.38764910347806, 4.886512756347656, "1"],
        [52.38576324505702, 4.885268211364746, "1"],
        [52.384191634830856, 4.888615608215332, "1"],
        [52.38665379935076, 4.891748428344727, "1"],
        [52.38358916941018, 4.893035888671875, "1"],
        [52.38170313755076, 4.895052909851074, "1"],

        [52.38450596135191, 4.8838090896606445, "2"],
        [52.371407126882495, 4.89565372467041, "2"],
        [52.370332850083045, 4.894752502441406, "2"],

        [52.38293430636731, 4.886684417724609, "3"],
        [52.38379872353246, 4.885096549987793, "3"],
        [52.38204367704105, 4.888443946838379, "3"],
        [52.380471934403026, 4.891448020935058, "3"],
        [52.38002659715026, 4.892992973327637, "3"],
        [52.381598355640726, 4.889259338378906, "3"],
        [52.3810220506906, 4.890718460083008, "3"],
        [52.379057318191556, 4.894452095031738, "3"],
        [52.38005279358358, 4.897456169128418, "5"],
        [52.37926689382331, 4.899687767028809, "5"],
        [52.37890013581495, 4.897799491882323, "5"],
        [52.37890013581495, 4.897799491882323, "5"],
        [52.373267398077964, 4.898099899291992, "5"],
        [52.37449880210737, 4.896211624145508, "5"],
        [52.37512759092267, 4.898529052734375, "5"],
        [52.3789787270732, 4.901018142700195, "5"],
        [52.37764265665995, 4.902305603027344, "5"],
        [52.37751166718868, 4.898614883422852, "5"],
        [52.37772125015624, 4.895739555358887, "5"],
        [52.376804317329444, 4.900074005126953, "5"],
        [52.377013903654124, 4.894752502441406, "5"],
        [52.37596596208372, 4.896640777587891, "5"],
        [52.375939763225844, 4.893121719360352, "5"],
        [52.37481319763409, 4.8950958251953125, "5"],
        [52.372638582778045, 4.900331497192383, "5"],
        [52.37224556866933, 4.898314476013184, "5"],
        [52.37449880210737, 4.900374412536621, "5"]
            ];

    var heat = L.heatLayer(latlngs, {
        radius: 25,
        blur: 20,
        max: 1.5,
        gradient: {
            0.2: '#E5CD90',
            0.50: '#B9B9B5',
            1: '#941E64'
        }
    }).addTo(map);

    //disable dragging
    map.dragging.disable();
    map.touchZoom.disable();
    map.doubleClickZoom.disable();
    map.scrollWheelZoom.disable();
    map.boxZoom.disable();
    map.keyboard.disable();


    //    //set foto's september on map
    //    var setFotoLocation = function (fotosData) {
    //        var Amountfotos = fotosData.length,
    //            f = 0;
    //        for (f; f < Amountfotos; f++) {
    //            var longitude = fotosData[f].log;
    //            var latitude = fotosData[f].lat;
    //            L.marker([latitude, longitude], {
    //                icon: fotoIcon,
    //            }).addTo(map);
    //        }
    //    };
    //    //    set foto's july on map
    //    var setFotoLocationJuly = function (fotosData) {
    //        var Amountfotos = fotosData.length,
    //            f = 0;
    //        for (f; f < Amountfotos; f++) {
    //            var longitude = fotosData[f].log;
    //            var latitude = fotosData[f].lat;
    //            L.marker([latitude, longitude], {
    //                icon: fotoIconJuly,
    //            }).addTo(map);
    //        }
    //    };
    //    //     set foto's August on map
    //    var setFotoLocationAugust = function (fotosData) {
    //        var Amountfotos = fotosData.length,
    //            f = 0;
    //        for (f; f < Amountfotos; f++) {
    //            var longitude = fotosData[f].log;
    //            var latitude = fotosData[f].lat;
    //            L.marker([latitude, longitude], {
    //                icon: fotoIconAugust,
    //            }).addTo(map);
    //        }
    //    };
    //
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
        "fillColor": "#fff",
        "fillOpacity": 0.0,
        "color": "RGBA(255, 255, 255, 0)"
    }

    var geojson;

    //What happens on mouseover
    function highlightFeature(e) {
        //        var layer = e.target;
        //        var layerName = layer.feature.properties.name;
        //        if (layerName !== "rightgone" && layerName !== "leftgone") {
        //            layer.setStyle({
        //                //                weight: 5,
        //                fillColor: '#D83E41',
        //                dashArray: '',
        //                fillOpacity: 1
        //            });
        //            if (!L.Browser.ie && !L.Browser.opera) {
        //                layer.bringToFront();
        //            };
        //        };

        var layer = e.target;
        var layerName = layer.feature.properties.name,
            SvgMapPart = selector('.mappopup'),
            popup = selector('.popup');

        SvgMapPart.classList.remove("none");
        var xPosition = event.clientX;
        var yPosition = event.clientY;
        if (layerName !== "rightgone" && layerName !== "leftgone") {
            popup.innerHTML = layerName;
            SvgMapPart.style.position = "absolute";
            SvgMapPart.style.left = xPosition + -30 + 'px';
            SvgMapPart.style.top = yPosition + -130 + 'px';

            layer.setStyle({
                //                weight: 5,
                fillColor: '#D83E41',
                dashArray: '',
                fillOpacity: 1
            });
            if (!L.Browser.ie && !L.Browser.opera) {
                layer.bringToFront();
            };
        } else {
            SvgMapPart.classList.add("none");
        }



    };

    //reset on mouseout
    function resetHighlight(e) {
        geojson.resetStyle(e.target);
    };

    function clickFeature(e) {
        //        console.log(layerNames)
        //        var layer = e.target,
        //            layerName = layer.feature.properties.name,
        //            SvgMapPart = selector('.mappopup'),
        //            popup = selector('.popup');
        //
        //        SvgMapPart.classList.remove("none");
        //        var xPosition = event.clientX;
        //        var yPosition = event.clientY;
        //
        //        //If clicked outside of Amsterdam Centrum, no div is being shown
        //        if (layerName !== "rightgone" && layerName !== "leftgone") {
        //            popup.innerHTML = layerName;
        //            SvgMapPart.style.position = "absolute";
        //            SvgMapPart.style.left = xPosition + -30 + 'px';
        //            SvgMapPart.style.top = yPosition + -90 + 'px';
        //        };
    };

    function onEachFeature(feature, layer) {
        //        console.log(layer._path)
        ////        layer._path.id = feature.properties.id;
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

          geojson.eachLayer(function (layer) {
        layer._path.id = layer.feature.properties.id;
    });
    };

    //filters
    var closed = false;
    toggleFilter.addEventListener('click', function () {
        if (closed === false) {
            var windowWidth = window.innerHeight;
            closed = true;
            TweenMax.to(filter, 2, {
                x: -243
            });
            TweenMax.to(toggleFilterImg, 2, {
                rotation: -45
            });
            TweenMax.to(informotion, 2, {
                width: windowWidth,
                css: {
                    marginLeft: -243
                }
            });
        } else {
            var informotionWidth = informotion.offsetWidth;
            closed = false;
            TweenMax.to(filter, 2, {
                x: 0
            });
            TweenMax.to(toggleFilterImg, 2, {
                rotation: 0
            });
            TweenMax.to(informotion, 2, {
                width: informotionWidth,
                css: {
                    marginLeft: -0
                }
            });
        }
    });
    //crowdedness
    crowdedness.addEventListener('mouseover', function () {
        TweenMax.to(crowdedness, 0.2, {
            opacity: 0.60
        });
    });
    crowdedness.addEventListener('mouseout', function () {
        TweenMax.to(crowdedness, 0.2, {
            opacity: 1
        });
    });
    crowdedness.addEventListener('click', function () {
        crowdedness.classList.toggle('disabled')
    });

    //trashes
    trashes.addEventListener('mouseover', function () {
        TweenMax.to(trashes, 0.2, {
            opacity: 0.60
        });
    });
    trashes.addEventListener('mouseout', function () {
        TweenMax.to(trashes, 0.2, {
            opacity: 1
        });
    });
    trashes.addEventListener('click', function () {
        trashes.classList.toggle('disabled')
    });

    //cleaningIntensity
    cleaningIntensity.addEventListener('mouseover', function () {
        TweenMax.to(trashes, 0.2, {
            opacity: 0.60
        });
    });
    cleaningIntensity.addEventListener('mouseout', function () {
        TweenMax.to(cleaningIntensity, 0.2, {
            opacity: 1
        });
    });
    cleaningIntensity.addEventListener('click', function () {
        cleaningIntensity.classList.toggle('disabled')
    });

    //wijken
    wijken.addEventListener('mouseover', function () {
        TweenMax.to(wijken, 0.2, {
            opacity: 0.60
        });
    });
    wijken.addEventListener('mouseout', function () {
        TweenMax.to(wijken, 0.2, {
            opacity: 1
        });
    });
    wijken.addEventListener('click', function () {
        if (wijkenP.innerHTML === "Verberg wijken") {
            wijkenP.innerHTML = "toon wijken"

        } else {
            wijkenP.innerHTML = "Verberg wijken"

        }

    });

};
