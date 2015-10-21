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
        districts = selector('.districts'),
        districtsP = selector('.districts p');

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

    var layerIDs = [];       
    HTTP.get(Meteor.absoluteUrl("data/map.json"), function (err, result) {                
        geoData = result.data;                
        var gData = geoData.features;
        var i = 0;        
        for (i; i < gData.length; i++) {            
            layerIDs.push(gData[i].properties.id);
        };                
        geoDatafunction(geoData);        
    });   

    HTTP.get(Meteor.absoluteUrl("data/schoonmaakintensiteit.json"), function (err, result) {                
        heatmapLayer = result.data;                
        createheatmap(heatmapLayer);        
    });    

    //create leaflet map and start coordiates
    var map = L.map('map', {
        center: [52.376956, 4.902756],
        maxZoom: 10,
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

    var fotoIconSeptember = L.divIcon({
        className: 'foto-icon-september'
    });
    var fotoIconJuly = L.divIcon({
        className: 'foto-icon-july'
    });
    var fotoIconAugust = L.divIcon({
        className: 'foto-icon-august'
    }); 


    //    var createheatmap = function (heatmapLayer) {
    //        var heat = L.heatLayer(heatmapLayer, {
    //            radius: 18,
    //            blur: 20,
    //            max: 1.5,
    //            gradient: {
    //                0: '#FFB700',
    //                0.5: '#FFB700',
    //                0.75: '#21B532',
    //                0.80: '#941E64',
    ////                0.50: '#C45D9A',
    ////                0.60: '#B13B80',
    //                1: '#941E64'
    //            }
    //        }).addTo(map);
    //    }

    //disable dragging
    map.dragging.disable();
    map.touchZoom.disable();
    map.doubleClickZoom.disable();
    map.scrollWheelZoom.disable();
    map.boxZoom.disable();
    map.keyboard.disable();

    //set foto's september on map
    var setFotoLocation = function (fotosData) {
        var Amountfotos = fotosData.length,
            f = 0;
        for (f; f < Amountfotos; f++) {
            var longitude = fotosData[f].log;
            var latitude = fotosData[f].lat;
            L.marker([latitude, longitude], {
                icon: fotoIconSeptember,
            }).addTo(map);
        }
    };
    //    set foto's july on map
    var setFotoLocationJuly = function (fotosData) {
        var Amountfotos = fotosData.length,
            f = 0;
        for (f; f < Amountfotos; f++) {
            var longitude = fotosData[f].log;
            var latitude = fotosData[f].lat;
            L.marker([latitude, longitude], {
                icon: fotoIconJuly,
            }).addTo(map);
        }
    };
    //     set foto's August on map
    var setFotoLocationAugust = function (fotosData) {
        var Amountfotos = fotosData.length,
            f = 0;
        for (f; f < Amountfotos; f++) {
            var longitude = fotosData[f].log;
            var latitude = fotosData[f].lat;
            L.marker([latitude, longitude], {
                icon: fotoIconAugust,
            }).addTo(map);
        }
    };

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
        var layer = e.target;
        var layerName = layer.feature.properties.name,
            SvgMapPart = selector('.mappopup'),
            popup = selector('.popup'),
            overlayList = document.querySelectorAll(".overlay");
       
        var xPosition = event.clientX;
        var yPosition = event.clientY;

        //If there are elements with the "overlay" class, then hover will work and shows popup. Otherwise not.
        if (overlayList.length === 0) {
            SvgMapPart.classList.remove("none");
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
                }
            } else {
                console.log("out of order")
                    //adds class that hides the popup
                SvgMapPart.classList.add("none");
            }
        };
    };
    //reset on mouseout
    function resetHighlight(e) {
        geojson.resetStyle(e.target);
    };

    function clickFeature(e, gData) {
        var layertje = e.target,
            layerName = layertje.feature.properties.name,
            layerID = layertje.feature.properties.id,
            SvgMapPart = selector('.mappopup'),
            overlayList = document.querySelectorAll(".overlay");

        SvgMapPart.classList.add("none");

        //If there are elements with the "overlay" class, then classes will be added to paths. Otherwise not.
        if (overlayList.length === 0) {
            //gives classes to paths, with which they can be styled
            if (layerName !== "rightgone" && layerName !== "leftgone") {
                var i = 0;
                for (i; i < layerIDs.length; i++) {
                    var checkingz = document.getElementById(layerIDs[i]).className;
                    //                console.log(document.getElementById(layerIDs[i]));

                    if (layerIDs[i] !== layerID) {
                        document.getElementById(layerIDs[i]).setAttribute('class', 'overlay');
                    } else {
                        document.getElementById(layerIDs[i]).setAttribute('class', 'transparent');
                    };
                };
            };
        };
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

        geojson.eachLayer(function (layer) {
            layer._path.id = layer.feature.properties.id;
        });
    };

    //filters
    var closed = false;
    var myMap = document.getElementById("map");
    var windowWidth = window.innerWidth; 
    var informotionWidth = windowWidth - 243 + "px";
   
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
            TweenMax.to(myMap, 2, {left: "100px"});
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
            TweenMax.to(myMap, 2, {left: 0});
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
        crowdedness.classList.toggle('disabled');
        var fotoAugust = selectors('.foto-icon-august'),
            fotoJuly = selectors('.foto-icon-july'),
            fotoSeptember = selectors('.foto-icon-september'),
            a = 0,
            j = 0,
            s = 0;
        for (a; a < fotoAugust.length; a++) {
            fotoAugust[a].classList.toggle("none");
        };
        for (j; j < fotoJuly.length; j++) {
            fotoJuly[j].classList.toggle("none");
        }
        for (s; s < fotoSeptember.length; s++) {
            fotoSeptember[s].classList.toggle("none");
        }
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
    var trashesfilter = false;
    trashes.addEventListener('click', function () {
        var trashIcons = selectors('.trashicon'),
            t = 0;
        trashes.classList.toggle('disabled');
        for (t; t < trashIcons.length; t++) {
            trashIcons[t].classList.toggle("none");
        }
    });

    //cleaningIntensity
    cleaningIntensity.addEventListener('mouseover', function () {
        TweenMax.to(cleaningIntensity, 0.2, {
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

    //districts
    districts.addEventListener('mouseover', function () {
        TweenMax.to(districts, 0.2, {
            opacity: 0.60
        });
    });
    districts.addEventListener('mouseout', function () {
        TweenMax.to(districts, 0.2, {
            opacity: 1
        });
    });
    districts.addEventListener('click', function () {
        if (districtsP.innerHTML === "Verberg wijken") {
            districtsP.innerHTML = "Toon wijken"
            var i = 0;
            for (i; i < layerIDs.length; i++) {
                console.log(layerIDs[i])
                if (layerIDs[i] !== "left-gone" && layerIDs[i] !== "right-gone") {
                    document.getElementById(layerIDs[i]).removeAttribute('class');
                }
            };
        } else {
            districtsP.innerHTML = "Verberg wijken"
            var i = 0;
            for (i; i < layerIDs.length; i++) {
                if (layerIDs[i] !== "left-gone" && layerIDs[i] !== "right-gone") {
                    document.getElementById(layerIDs[i]).setAttribute('class', 'showdistrict');
                }
            };
        }
    });
};
