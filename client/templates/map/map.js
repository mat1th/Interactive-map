//create Collections
var trashesCollection = new Meteor.Collection('trashesCollection');
var fotoLocationsCollection = new Meteor.Collection('fotoLocationsCollection');
var fotoLocationsJulyCollection = new Meteor.Collection('fotoLocationsJulyCollection');
var fotoLocationsAugustCollection = new Meteor.Collection('fotoLocationsAugustCollection');

//if template "map" is rendered
Template.map.rendered = function () {

    //create funtion for easy selection of id's and classes
    var selector = function (selector) {
            return document.querySelector(selector);
        },
        selectors = function (selector) {
            return document.querySelectorAll(selector);
        };

    /*
    _____________________________________________________________
    |***********************************************************|
    |************************Local vars*************************|
    |***********************************************************|
    -------------------------------------------------------------
    */
    var logo = selector('.logo'),
        toggleFilterImg = selector('.togglefilterimg'),
        toggleFilter = selector('.togglefilter'),
        toggleStatistics = selector('.togglestatistics'),
        toggleStatisticsImg = selector('.togglestatisticimg'),
        filter = selector('.filter'),
        informotion = selector('.informotion'),
        crowdedness = selector('.crowdedness'),
        crowdednessInput = selector('#crowdedness'),
        trashes = selector('.trashes'),
        trashesInput = selector('#trashes'),
        cleaningIntensity = selector('.cleaning-intensity'),
        cleaningIntensityDiv = selector('.cleaning-intensity-div'),
        cleaningIntensityInput = selector('#cleaning-intensity'),
        statisticSubscript = selector('.statsubscript'),
        cleaningBorder = selector('.cleaningBorder'),
        nextMonth = selector('.nextmonth'),
        monthSelect = selector('.monthselect'),
        previousMonth = selector('.previousmonth'),
        months = selector('.months'),
        month = selector('.month'),
        closeButton = selector('.close'),
        statistic = selector('.statistic'),
        districtname = selector('.districtname'),
        navigationBar = selector('.navigationbar'),
        gradeMark = selector('.grade-mark'),
        amountTrashesMark = selector('.amount-trashes-mark'),
        cleaningintensity = selector('.cleaningintensity-label'),
        previousDistrict = selector('.previousdistrict'),
        nextDistrict = selector('.nextdistrict'),
        layers = [],
        layerIDs = [],
        districtsData = null,
        geojson,
        zoomState = false;

    /*
    _____________________________________________________________
    |***********************************************************|
    |***************Collections and get all data****************|
    |***********************************************************|
    -------------------------------------------------------------
    */

    //subscribe to trashesCollection
    Meteor.subscribe('trashesCollection', function () {
        var trashesData = trashesCollection.find().fetch();
        //callback to setTrashes
        setTrashes(trashesData)
    });

    //subscribe to fotoLocationsCollection, subscribes to Meteor.publish in server_get_clean_data.js
    Meteor.subscribe('fotoLocationsJulyCollection', function () {
        var fotosDataJuly = fotoLocationsJulyCollection.find().fetch();
        setFotoLocationJuly(fotosDataJuly);
        Meteor.subscribe('fotoLocationsAugustCollection', function () {
            var fotosDataAugust = fotoLocationsAugustCollection.find().fetch();
            Meteor.subscribe('fotoLocationsCollection', function () {
                var fotosDataSeptember = fotoLocationsCollection.find().fetch();
                toggleMonths(fotosDataJuly, fotosDataAugust, fotosDataSeptember)
            });
        });
    });

    //Gets data from map.json and sends it as a parameter to geoDatafunction
    HTTP.get(Meteor.absoluteUrl("data/map.json"), function (err, result) {                
        var geoData = result.data;
        var gData = geoData.features;
        var i = 0;
        for (i; i < gData.length; i++) {
            layerIDs.push(gData[i].properties.id);
        };            
        geoDatafunction(geoData);
    });   

    HTTP.get(Meteor.absoluteUrl("data/districtsdata.json"), function (err, result) {                
        districtsData = result.data;
    });  

    /*
    _____________________________________________________________
    |***********************************************************|
    |************************Create map*************************|
    |***********************************************************|
    -------------------------------------------------------------
    */

    //create leaflet map and start coordinates
    var map = L.map('map', {
        center: [52.376956, 4.902756],
        maxZoom: 20,
        minZoom: 14,
        zoom: 14,
        zoomControl: false,
        attributionControl: false,
        maxBounds: [[52.345197800248926, 4.82025146484375],
                    [52.424825961602764, 4.967708587646484]]
    });

    //begin state of map
    map.fitBounds([
        [52.35746570026433, 4.863853454589844],
        [52.391734853683936, 4.944705963134766]
    ]);

    //Creates a tilelayer representing the streets on top of the map
    var baseLayer = L.tileLayer(
        'http://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}.png', {
            attribution: 'Informotion',
            subdomains: 'abcd',
            maxZoom: 19
        });

    //Chose the tilelayer provider and adds tilelayer to map
    L.tileLayer.provider('CartoDB.PositronNoLabels').addTo(map);

    //diable double Click Zooming
    map.doubleClickZoom.disable();

    //create divs containing the icons for photos and trash
    var trashIcon = L.divIcon({
        className: 'trashicon'
    });
    var fotoIconJuly = L.divIcon({
        className: 'foto-icon-july'
    });
    var fotoIconAugust = L.divIcon({
        className: 'foto-icon-august'
    }); 
    var fotoIconSeptember = L.divIcon({
        className: 'foto-icon-september'
    });

    /*
    _____________________________________________________________
    |***********************************************************|
    |************************plot on map************************|
    |***********************************************************|
    -------------------------------------------------------------
    */

    // set foto's july on map
    var setFotoLocationJuly = function (fotosDataJuly) {
        var Amountfotos = fotosDataJuly.length,
            f = 0;
        for (f; f < Amountfotos; f++) {
            var longitude = fotosDataJuly[f].log;
            var latitude = fotosDataJuly[f].lat;
            L.marker([latitude, longitude], {
                icon: fotoIconJuly,
            }).addTo(map);
        }
    };

    //set trashes on map in a new layer
    var setTrashes = function (trashesData) {
        var markers = new L.FeatureGroup(),
            trashnumber = 0;

        function getLatLng(map) {
            var lngSpan = trashesData[trashnumber].log,
                latSpan = trashesData[trashnumber].lat;
            trashnumber++;
            return new L.LatLng(
                latSpan,
                lngSpan);
        }

        function trashes() {
            for (var i = 0; i < trashesData.length; i++) {
                var marker = L.marker(getLatLng(map), {
                    icon: trashIcon
                });
                markers.addLayer(marker);
            }
            return false;
        }
        map.addLayer(markers);
        trashes();
    };

    //add click and mouse functions to layers
    function onEachFeature(feature, layer) {
        layers.push(layer)
        layer.on({
            mouseover: highlightFeature,
            mouseout: resetHighlight,
            click: clickFeature
        });
    };

    //Styling for the map
    var transparentStyle = {
        "fillColor": "#fff",
        "fillOpacity": 0.0,
        "color": "RGBA(255, 255, 255, 0)"
    };

    //Creates the map of Amsterdam Centrum and renders it with a cleaningintensity beneath it
    var geoDatafunction = function (geoData) {
        //Creates the cleaningintensity layer
        cleaningIntensity = L.geoJson(geoData, {
            style: function (feature) {
                return {
                    "fillColor": feature.properties.fill,
                    "fillOpacity": 0.6,
                    "weight": 0
                };
            }
        }).addTo(map);

        //Adds class to path of each layer
        cleaningIntensity.eachLayer(function (layer) {
            layer._path.classList.add("cleaningIntensityLayer")
        });

        //Creates layer containing geoData, this creates the map of Amsterdam Centrum
        geojson = L.geoJson(geoData, {
            style: transparentStyle,
            onEachFeature: onEachFeature
        }).addTo(map);

        //Get id's from layers
        geojson.eachLayer(function (layer) {
            layer._path.id = layer.feature.properties.id;
        });
    };

    /*
    _____________________________________________________________
    |***********************************************************|
    |**********************Actions on map***********************|
    |***********************************************************|
    -------------------------------------------------------------
    */

    //What happens on mouseover
    function highlightFeature(e) {
        var layer = e.target,
            layerName = layer.feature.properties.name,
            layerID = layer.feature.properties.id,
            SvgMapPart = selector('.mappopup'),
            popup = selector('.popup'),
            overlayList = document.querySelectorAll(".overlay"),
            xPosition = event.clientX,
            yPosition = event.clientY;

        //If there are elements with the "overlay" class, then hover will work and shows popup. Otherwise not.
        if (overlayList.length === 0) {
            SvgMapPart.classList.remove("none");
            if (layerName !== "rightgone" && layerName !== "leftgone") {
                popup.innerHTML = layerName;
                SvgMapPart.style.position = "absolute";
                SvgMapPart.style.left = xPosition + -20 + 'px';
                SvgMapPart.style.top = yPosition + -90 + 'px';
                layer.setStyle({
                    fillColor: '#D83E41',
                    dashArray: '',
                    fillOpacity: 1
                });
                if (!L.Browser.ie && !L.Browser.opera) {
                    layer.bringToFront();
                }
            } else {
                //adds class that hides the popup
                SvgMapPart.classList.add("none");
            };
        };
    };

    //reset style on mouseout
    function resetHighlight(e) {
        geojson.resetStyle(e.target);
    };

    //What happens when a layer is clicked
    function clickFeature(e) {
        //check if the map isn't in the zoom state, if it is in zoomstate, clickfeature doesn't work
        if (zoomState === false) {
            zoomState = true;
            var clickedLayer = e.target,
                layerName = clickedLayer.feature.properties.name,
                layerID = clickedLayer.feature.properties.id,
                SvgMapPart = selector('.mappopup'),
                overlayList = document.querySelectorAll(".overlay");

            //rightgone and leftgone are the surrounding areas, they are not relevant
            if (layerName !== "rightgone" && layerName !== "leftgone") {

                //display and hide elements
                SvgMapPart.classList.add("none");
                closeButton.classList.remove("none");
                navigationBar.classList.remove("none");

                //Added animations to elements
                TweenMax.to(statistic, 2, {
                    display: "block"
                }, "start");

                TweenMax.fromTo(statistic, 2, {
                    x: 500
                }, {
                    x: 0,
                    ease: Power4.easeOut
                }, "start");

                TweenMax.to([cleaningIntensityDiv, cleaningBorder], 1, {
                    ease: Power1.easeOut,
                    opacity: 0,
                    y: -20,
                    onComplete: function (response) {
                        cleaningIntensityDiv.classList.add("none");
                    }
                });
                TweenMax.to(monthSelect, 1.2, {
                    ease: Back.easeIn.config(1),
                    right: 150
                });
                TweenMax.to(closeButton, 1.2, {
                    ease: Back.easeIn.config(1),
                    right: 0
                });
                TweenMax.to(navigationBar, 1.2, {
                    ease: Back.easeOut.config(1),
                    bottom: -20
                });
                TweenMax.to(statistic, 1.5, {
                    ease: Back.easeIn.config(1),
                    right: 0
                });

                //zoom in to district
                var district = e.target,
                    districtId = district.feature.properties.id,
                    getBoundsOfDistrict = district.getBounds();
                DistrictNorthEastlng = getBoundsOfDistrict._northEast.lng + 0.008,
                    DistrictNorthEastlat = getBoundsOfDistrict._northEast.lat,
                    DistrictSouthWestlng = getBoundsOfDistrict._southWest.lng + 0.004;

                //Exceptions for bigger districts so they get different values to fit in the window
                if (districtId === "wp") {
                    DistrictSouthWestlat = getBoundsOfDistrict._southWest.lat - 0.005;
                } else if (districtId === "dws") {
                    DistrictSouthWestlat = getBoundsOfDistrict._southWest.lat - 0.005;
                } else {
                    DistrictSouthWestlat = getBoundsOfDistrict._southWest.lat - 0.002;
                };

                var southWest = L.latLng(DistrictSouthWestlat, DistrictSouthWestlng),
                    northEast = L.latLng(DistrictNorthEastlat, DistrictNorthEastlng),
                    bounds = L.latLngBounds(southWest, northEast);

                //zoom in on map
                map.fitBounds(bounds);
                districtname.innerHTML = layerName;
                setDistrictData(layerID);
                hideCleaningsIntensityLayer();

                //disable dragging and zooming when in zoom state
                map.dragging.disable();
                map.touchZoom.disable();
                map.doubleClickZoom.disable();
                map.scrollWheelZoom.disable();
                map.boxZoom.disable();
                map.keyboard.disable();

                //If there are elements with the "overlay" class, then classes will be added to paths. Otherwise not.
                if (overlayList.length === 0) {
                    //gives classes to paths, with which they can be styled
                    if (layerName !== "rightgone" && layerName !== "leftgone") {
                        var j = 0;
                        for (j; j < layerIDs.length; j++) {
                            if (layerIDs[j] !== layerID) {
                                document.getElementById(layerIDs[j]).setAttribute('class', 'overlay');
                            } else {
                                document.getElementById(layerIDs[j]).setAttribute('class', 'transparent');
                            };
                        };
                    };
                };
            }
        };
    };

    //hide cleaning intensity layer used by filter and zooming funtion
    var hideCleaningsIntensityLayer = function () {
        var cleaningIntensityLayer = selectors('.cleaningIntensityLayer'),
            t = 0;

        for (t; t < cleaningIntensityLayer.length; t++) {
            cleaningIntensityLayer[t].classList.toggle("none");
        }
    };

    //Shows data in statistics pane when in zoom state
    var setDistrictData = function (layerID) {
        if (districtsData !== null && districtsData !== undefined) {
            var indexLayer = layerIDs.indexOf(layerID),
                districtData = districtsData[layerID],
                previousNumber = indexLayer - 1,
                nextNumber = indexLayer + 1,
                previousID, nextID;

            gradeMark.innerHTML = JSON.stringify(districtData.mark).replace('.', ',');
            //Rounds the number with two numbers after the comma
            amountTrashesMark.innerHTML = JSON.stringify(Math.round(districtData.trashes / districtData.sqmeters * 1000 * 100) / 100).replace('.', ',') + " per m²"
            cleaningintensity.innerHTML = districtData.cleaningintensity;
            statisticSubscript.innerHTML = districtData.subscript;
            districtname.innerHTML = districtData.name;

            //funtion to give id to naviation buttons
            if (indexLayer === 0) {
                previousID = layerIDs[layerIDs.length - 3];
                nextID = layerIDs[nextNumber];
            }
            if (indexLayer === layerIDs.length - 3) {
                previousID = layerIDs[previousNumber];
                nextID = layerIDs[0];
            }
            if (indexLayer !== 0 && indexLayer !== layerIDs.length - 3) {
                previousID = layerIDs[previousNumber];
                nextID = layerIDs[nextNumber];
            }
            nextDistrict.setAttribute('id', nextID + "2");
            previousDistrict.setAttribute('id', previousID + "2");
        }
    };

    //Get bounds of districts for scrolling through districts with nav bar
    function getBoundsOfDistrict(DistrictID) {
        var j = 0;
        for (j; j < layers.length; j++) {
            if (layers[j]._path.id === DistrictID) {
                var getBoundsOfDistrict = layers[j]._bounds,
                    districtId = layers[j].feature.properties.id,
                    DistrictNorthEastlng = getBoundsOfDistrict._northEast.lng + 0.008,
                    DistrictNorthEastlat = getBoundsOfDistrict._northEast.lat,
                    DistrictSouthWestlng = getBoundsOfDistrict._southWest.lng + 0.004;

                if (districtId === "wp") {
                    DistrictSouthWestlat = getBoundsOfDistrict._southWest.lat - 0.005;
                } else if (districtId === "dws") {
                    DistrictSouthWestlat = getBoundsOfDistrict._southWest.lat - 0.005;
                } else {
                    DistrictSouthWestlat = getBoundsOfDistrict._southWest.lat - 0.002;
                }

                var southWest = L.latLng(DistrictSouthWestlat, DistrictSouthWestlng),
                    northEast = L.latLng(DistrictNorthEastlat, DistrictNorthEastlng),
                    bounds = L.latLngBounds(southWest, northEast);

                map.fitBounds(bounds)
            }
        }
    }

    /*
    _____________________________________________________________
    |***********************************************************|
    |*********Close zoomed state and go to overview*************|
    |***********************************************************|
    -------------------------------------------------------------
    */

    //hover actions close button
    closeButton.addEventListener('mouseover', function () {
        TweenMax.to(closeButton, 0.2, {
            ease: Back.easeIn.config(1),
            opacity: 0.60
        });
    });
    closeButton.addEventListener('mouseout', function () {
        TweenMax.to(closeButton, 0.2, {
            ease: Back.easeIn.config(1),
            opacity: 1
        });
    });

    //close the zoomed in state
    closeButton.addEventListener('click', function () {
        closeZoomState()
    });

    var closeZoomState = function () {
        hideCleaningsIntensityLayer()
        zoomState = false;
        TweenMax.to(monthSelect, 1.2, {
            ease: Back.easeIn.config(1),
            right: 0
        });
        TweenMax.to(closeButton, 1.2, {
            ease: Back.easeIn.config(1),
            right: -150,
            onComplete: function (response) {
                closeButton.classList.add("none");
            }
        });
        TweenMax.to(navigationBar, 1.2, {
            ease: Back.easeIn.config(1),
            bottom: -100,
            onComplete: function (response) {
                navigationBar.classList.add("none");
            },
        });
        cleaningIntensityDiv.classList.remove("none");

        TweenMax.to([cleaningIntensityDiv, cleaningBorder], 1.5, {
            ease: Power1.easeOut,
            opacity: 1,
            y: 0
        });

        TweenMax.to(statistic, 1.3, {
            x: 500,
            ease: Power4.easeIn,
            display: "none"
        }, "statsaway");
        TweenMax.to(statistic, 2, {
            display: "none"
        }, "statsaway");

        //zoom out
        map.fitBounds([
            [52.35746570026433, 4.863853454589844],
            [52.391734853683936, 4.944705963134766]
        ]);

        //enable dragging and zooming
        map.dragging.enable();
        map.touchZoom.enable();
        map.doubleClickZoom.disable();
        map.scrollWheelZoom.enable();
        map.boxZoom.enable();
        map.keyboard.enable();

        var i = 0;
        for (i; i < layerIDs.length; i++) {
            document.getElementById(layerIDs[i]).removeAttribute('class', 'overlay');
            document.getElementById(layerIDs[i]).removeAttribute('class', 'transparent');
        };
    };

    /*
    _____________________________________________________________
    |***********************************************************|
    |*****************Mouse actions districts*******************|
    |***********************************************************|
    -------------------------------------------------------------
    */

    //add functionality to previousDistrict button, so you can go to the previous district
    previousDistrict.addEventListener('click', function (e) {
        GoToPreviousDistrict()
    });

    //add functionality to nextDistrict button, so you can go to the next district
    nextDistrict.addEventListener('click', function (e) {
        GoToNextDistrict()
    });

    var GoToPreviousDistrict = function () {
        pDID = previousDistrict.getAttribute('id');
        var previousDistrictID = pDID.replace('2', '');
        var j = 0;
        for (j; j < layerIDs.length; j++) {
            if (layerIDs[j] !== previousDistrictID) {
                document.getElementById(layerIDs[j]).setAttribute('class', 'overlay');
                setDistrictData(previousDistrictID)
            } else {
                document.getElementById(layerIDs[j]).setAttribute('class', 'transparent');
                setDistrictData(previousDistrictID)
            };
        }
        getBoundsOfDistrict(previousDistrictID)
    }

    var GoToNextDistrict = function () {
        nDID = nextDistrict.getAttribute('id');
        var nextDistrictID = nDID.replace('2', '');
        var j = 0;
        for (j; j < layerIDs.length; j++) {
            if (layerIDs[j] !== nextDistrictID) {
                document.getElementById(layerIDs[j]).setAttribute('class', 'overlay');
                setDistrictData(nextDistrictID)
            } else {
                document.getElementById(layerIDs[j]).setAttribute('class', 'transparent');
                setDistrictData(nextDistrictID)
            };
        }
        getBoundsOfDistrict(nextDistrictID);
    }

    /*
    _____________________________________________________________
    |***********************************************************|
    |***********************toggle panes************************|
    |***********************************************************|
    -------------------------------------------------------------
    */

    //filters
    var filterClosed = false;
    var statisticsClosed = false;
    var myMap = document.getElementById("map");
    var windowWidth = window.innerWidth; 

    //open and close filter
    toggleFilter.addEventListener('click', function () {
        if (filterClosed === false) {
            TweenMax.to(filter, 2, {
                ease: Power2.easeInOut,
                x: -293
            });
            TweenMax.to(toggleFilterImg, 2, {
                ease: Power2.easeInOut,
                rotation: -45
            });

            if (statisticsClosed === true) {
                TweenMax.to(myMap, 2, {
                    ease: Power2.easeInOut,
                    left: -100
                });
            } else {
                TweenMax.to(myMap, 2, {
                    ease: Power2.easeInOut,
                    left: -250
                });
            }
            filterClosed = true;
        } else {
            TweenMax.to(filter, 2, {
                ease: Power2.easeInOut,
                x: 0
            });
            TweenMax.to(toggleFilterImg, 2, {
                ease: Power2.easeInOut,
                rotation: 0
            });
            if (statisticsClosed === true) {
                TweenMax.to(myMap, 2, {
                    ease: Power2.easeInOut,
                    left: 100
                });
            } else {
                TweenMax.to(myMap, 2, {
                    ease: Power2.easeInOut,
                    left: 1
                });
            }
            filterClosed = false;
        }
    });
    //open and close statistics
    toggleStatistics.addEventListener('click', function () {
        if (statisticsClosed === false) {
            TweenMax.to(statistic, 2, {
                ease: Power2.easeInOut,
                x: 350
            });
            TweenMax.to(toggleStatisticsImg, 2, {
                ease: Power2.easeInOut,
                rotation: 45
            });
            if (filterClosed === true) {
                TweenMax.to(myMap, 2, {
                    ease: Power2.easeInOut,
                    left: -150
                });
            } else {
                TweenMax.to(myMap, 2, {
                    ease: Power2.easeInOut,
                    left: 100
                });
            }
            TweenMax.to(statistic, 2, {
                ease: Power2.easeInOut,
                right: 0
            });
            statisticsClosed = true;
        } else {
            TweenMax.to(statistic, 2, {
                x: 0
            });
            TweenMax.to(toggleStatisticsImg, 2, {
                ease: Power2.easeInOut,
                rotation: 0
            });
            if (filterClosed === true) {
                TweenMax.to(myMap, 2, {
                    ease: Power2.easeInOut,
                    left: -250
                });
            } else {
                TweenMax.to(myMap, 2, {
                    ease: Power2.easeInOut,
                    left: 0
                });
            }
            statisticsClosed = false;
        }
    });

    /*
    _____________________________________________________________
    |***********************************************************|
    |*********************Filter functions**********************|
    |***********************************************************|
    -------------------------------------------------------------
    */

    //toggle crowdedness filter on or off
    crowdednessInput.addEventListener('click', function () {
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

    //toggle trashes filter on or off
    trashesInput.addEventListener('click', function () {
        var trashIcons = selectors('.trashicon'),
            t = 0;
        for (t; t < trashIcons.length; t++) {
            trashIcons[t].classList.toggle("none");
        }
    });
    //toggle cleaningintensity layer on or off
    cleaningIntensityInput.addEventListener('click', function () {
        hideCleaningsIntensityLayer()
    });

    // month controllers
    TweenMax.to(previousMonth, 0.2, {
        opacity: 0.3
    });

    /*
    _____________________________________________________________
    |***********************************************************|
    |******************Toggle through months********************|
    |***********************************************************|
    -------------------------------------------------------------
    */

    var slides = $('.slides');
    var $slideWrapper = $('.months');
    var width = [0, -44, -90, -185];
    var width2 = [0, 0, -90, -185];
    var currentMonthCount = 1;

    //move month text to next
    var moveToNext = function () {
        if (currentMonthCount !== 3) {
            currentMonthCount++;
            TweenMax.to(slides, 0.5, {
                x: width[currentMonthCount]
            });
            TweenMax.to(previousMonth, 0.2, {
                opacity: 1
            });
            if (currentMonthCount === 3) {
                TweenMax.to(nextMonth, 0.2, {
                    opacity: 0.3
                });
            }
        } else {
            TweenMax.to(nextMonth, 0.2, {
                opacity: 0.3
            });
        }
    };
    //move month text to previous
    var moveToPrevious = function () {
        if (currentMonthCount !== 1) {
            currentMonthCount--;
            TweenMax.to(slides, 0.5, {
                x: width2[currentMonthCount]
            });
            TweenMax.to(nextMonth, 0.2, {
                opacity: 1
            });
            if (currentMonthCount === 1) {
                TweenMax.to(previousMonth, 0.2, {
                    opacity: 0.3
                });
            }
        } else {
            TweenMax.to(previousMonth, 0.2, {
                opacity: 0.3
            });
        }
    };
    //add events to buttons
    nextMonth.addEventListener('mouseover', function () {
        if (currentMonthCount !== 3) {
            TweenMax.to(nextMonth, 0.2, {
                opacity: 0.60
            });
        }
    });
    nextMonth.addEventListener('mouseout', function () {
        if (currentMonthCount !== 3) {
            TweenMax.to(nextMonth, 0.2, {
                opacity: 1
            });
        }

    });
    previousMonth.addEventListener('mouseover', function () {
        if (currentMonthCount !== 1) {
            TweenMax.to(previousMonth, 0.2, {
                opacity: 0.60
            });
        }
    });
    previousMonth.addEventListener('mouseout', function () {
        if (currentMonthCount !== 1) {
            TweenMax.to(previousMonth, 0.2, {
                opacity: 1
            });
        }
    });

    //toggle through months
    function toggleMonths(fotosDataJuly, fotosDataAugust, fotosDataSeptember) {
        nextMonth.addEventListener('click', function () {
            var julyIcons = selectors('.foto-icon-july');
            var augustIcons = selectors('.foto-icon-august');
            var sepemberIcons = selectors('.foto-icon-september');

            setTimeout(function () {
                crowdedness.classList.remove('disabled');
                if (currentMonthCount === 2) {
                    var j = 0;
                    for (j; j < julyIcons.length; j++) {
                        julyIcons[j].parentNode.removeChild(julyIcons[j]);
                    }
                    // set foto's August on map
                    var AmountfotosAugust = fotosDataAugust.length,
                        f = 0;
                    for (f; f < AmountfotosAugust; f++) {
                        var longitude = fotosDataAugust[f].log;
                        var latitude = fotosDataAugust[f].lat;
                        L.marker([latitude, longitude], {
                            icon: fotoIconAugust,
                        }).addTo(map);
                    }
                }
                if (currentMonthCount === 3) {
                    var s = 0;
                    for (s; s < augustIcons.length; s++) {
                        augustIcons[s].parentNode.removeChild(augustIcons[s]);
                    }
                    //set foto's september on map
                    var AmountfotosSeptember = fotosDataSeptember.length,
                        sf = 0;
                    for (sf; sf < AmountfotosSeptember; sf++) {
                        var longitude = fotosDataSeptember[sf].log;
                        var latitude = fotosDataSeptember[sf].lat;
                        L.marker([latitude, longitude], {
                            icon: fotoIconSeptember,
                        }).addTo(map);
                    }
                }
            }, 800);
            moveToNext()
        });
        previousMonth.addEventListener('click', function () {
            var julyIcons = selectors('.foto-icon-july');
            var augustIcons = selectors('.foto-icon-august');
            var sepemberIcons = selectors('.foto-icon-september');

            setTimeout(function () {
                crowdedness.classList.remove('disabled');
                if (currentMonthCount === 1) {
                    var j = 0;
                    for (j; j < augustIcons.length; j++) {
                        augustIcons[j].parentNode.removeChild(augustIcons[j]);
                    }
                    // set foto's August on map
                    var AmountfotosJuly = fotosDataJuly.length,
                        f = 0;
                    for (f; f < AmountfotosJuly; f++) {
                        var longitude = fotosDataJuly[f].log;
                        var latitude = fotosDataJuly[f].lat;
                        L.marker([latitude, longitude], {
                            icon: fotoIconJuly,
                        }).addTo(map);
                    }
                }
                if (currentMonthCount === 2) {
                    var j = 0;
                    for (j; j < sepemberIcons.length; j++) {
                        sepemberIcons[j].parentNode.removeChild(sepemberIcons[j]);
                    }
                    // set foto's August on map
                    var AmountfotosAugust = fotosDataAugust.length,
                        f = 0;
                    for (f; f < AmountfotosAugust; f++) {
                        var longitude = fotosDataAugust[f].log;
                        var latitude = fotosDataAugust[f].lat;
                        L.marker([latitude, longitude], {
                            icon: fotoIconAugust,
                        }).addTo(map);
                    }
                }
            }, 800);
            moveToPrevious()
        });
    }

    /*
    _____________________________________________________________
    |***********************************************************|
    |************************shortcuts**************************|
    |***********************************************************|
    -------------------------------------------------------------
    */

    window.addEventListener("keydown", keysPressed, false);

    function keysPressed(e) {
        if (zoomState === true) {
            //arrow key ->
            if (e.keyCode === 39) {
                GoToNextDistrict()
            }
            //arrow key <-
            if (e.keyCode === 37) {
                GoToPreviousDistrict()
            }
            // esc key
            if (e.keyCode === 27) {
                closeZoomState()
            }
        }
    };

    /*
    _____________________________________________________________
    |***********************************************************|
    |***********************Other features**********************|
    |***********************************************************|
    -------------------------------------------------------------
    */

    logo.addEventListener('click', function () {
        location.reload();
    });
};