// marker collection
var Markers = new Meteor.Collection('markers');
Meteor.publish("markers", function () {
    return Markers.find();
});

//data collection
var trashesCollection = new Meteor.Collection('trashesCollection');
Meteor.publish("trashesCollection", function () {
    return trashesCollection.find();
});

var RawDataUrl,
    MapQuestUrl;

Meteor.startup(function () {
    HTTP.get(Meteor.absoluteUrl("url.json"), function (err, result) {
        if (err) {
            return err;
        }
        if (result) {
            var RawDataUrl = result.data.RawData,
                MapQuestUrl = result.data.MapQuest;
            getCleanData(RawDataUrl, MapQuestUrl);
        }
    });
});
var getCleanData = function (RawDataUrl, MapQuestUrl) {
    var rawData = HTTP.get(RawDataUrl).data,
        //create cleanData array
        cleanData = [],
        //get amount of data strings
        //amountDataStrings = rawData.feed.entry.length,
        amountDataStrings = 20,
        i = 0;

    //loop through data
    if (cleanData[0] === undefined) {
        for (i; i < amountDataStrings; i++) {
            var AllTrashData = rawData.feed.entry[i].content.$t,
                SplicedTrashData = AllTrashData.split(','),
                city = "Amsterdam",
                street = SplicedTrashData[3].split(':')[1],
                houseNumber = SplicedTrashData[4].split(':')[1],
                //    var fulness = array[11].split(':')[1];
                //    console.log(fulness);
                url = MapQuestUrl[0] + "\"" + street.replace(" ", "%20") + houseNumber.replace(" ", "%20") + "," + city + "\"" + MapQuestUrl[1];
            //             var gps = HTTP.get(url).data;
            var gps = {
                "info": {
                    "statuscode": 0,
                    "copyright": {
                        "text": "\u00A9 2015 MapQuest, Inc.",
                        "imageUrl": "http://api.mqcdn.com/res/mqlogo.gif",
                        "imageAltText": "\u00A9 2015 MapQuest, Inc."
                    },
                    "messages": []
                },
                "options": {
                    "maxResults": 1,
                    "thumbMaps": false,
                    "ignoreLatLngInput": false
                },
                "results": [{
                    "providedLocation": {
                        "street": " Nieuwmarkt 77,Amsterdam"
                    },
                    "locations": [{
                        "street": "New Market 77",
                        "adminArea6": "Amsterdam",
                        "adminArea6Type": "Neighborhood",
                        "adminArea5": "Amsterdam",
                        "adminArea5Type": "City",
                        "adminArea4": "MRA",
                        "adminArea4Type": "County",
                        "adminArea3": "North Holland",
                        "adminArea3Type": "State",
                        "adminArea1": "NL",
                        "adminArea1Type": "Country",
                        "postalCode": "1011MA",
                        "geocodeQualityCode": "P1XAX",
                        "geocodeQuality": "POINT",
                        "dragPoint": false,
                        "sideOfStreet": "N",
                        "linkId": "0",
                        "unknownInput": "",
                        "type": "s",
                        "latLng": {
                            "lat": 52.372009,
                            "lng": 4.900677
                        },
                        "displayLatLng": {
                            "lat": 52.372009,
                            "lng": 4.900677
                        }
                    }]
                }]
            }
            if (gps != undefined) {
                if (gps.results[0].locations[0].latLng != undefined) {
                    var longitude = gps.results[0].locations[0].latLng.lng,
                        latitude = gps.results[0].locations[0].latLng.lat,
                        cleanDataString = {
                            "street": street,
                            "houseNumber": houseNumber,
                            "log": longitude,
                            "lat": latitude
                        }

                    trashesCollection.insert(cleanDataString)
//                    if (cleanData.length === amountDataStrings) {
//                        createApi(cleanData)
//                    }

                }
            }
        }
    }
};

//var createApi = function (cleanData) {
//
//
//}





// Listen to incoming HTTP requests, can only be used on the server
WebApp.connectHandlers.use(function (req, res, next) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    return next();
});
