//trashesCollection collection
var trashesCollection = new Meteor.Collection('trashesCollection');
Meteor.publish("trashesCollection", function () {
    return trashesCollection.find();
});

//trashesCollection collection
var fotoLocationsCollection = new Meteor.Collection('fotoLocationsCollection');
Meteor.publish("fotoLocationsCollection", function () {
    return fotoLocationsCollection.find();
});


var rawDataUrl,
    mapQuestUrl;

Meteor.startup(function () {
    HTTP.get(Meteor.absoluteUrl("url.json"), function (err, result) {
        if (result) {
            var rawDataUrl = result.data.rawData,
                mapQuestUrl = result.data.mapQuest,
                flickrGetPlaceIdUrl = result.data.flickrGetPlaceId,
                flickrGetFotosUrl = result.data.flickrGetFotos,
                flickrGetGeoFotoUrl = result.data.flickrGetGeoFoto;
            getCleanData(rawDataUrl, mapQuestUrl);
            getGeoFlickrFotos(flickrGetPlaceIdUrl, flickrGetFotosUrl, flickrGetGeoFotoUrl)
        }
    });
});

//get geo data of trashes
var getCleanData = function (rawDataUrl, mapQuestUrl) {
    var rawData = HTTP.get(rawDataUrl).data,
        //create cleanData array
        //get amount of data strings
        //        amountDataStrings = rawData.feed.entry.length,
        amountDataStrings = 210,
        i = 0;

    //loop through data
    if (trashesCollection.find().fetch()[0] === undefined) {
        for (i; i < amountDataStrings; i++) {
            var AllTrashData = rawData.feed.entry[i].content.$t,
                SplicedTrashData = AllTrashData.split(','),
                city = "Amsterdam",
                street = SplicedTrashData[3].split(':')[1],
                houseNumber = SplicedTrashData[4].split(':')[1],
                //    var fulness = array[11].split(':')[1];
                url = mapQuestUrl[0] + "\"" + street.replace(" ", "%20") + houseNumber.replace(" ", "%20") + "," + city + "\"" + mapQuestUrl[1];
            var gps = HTTP.get(url).data;

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
                    console.log(trashesCollection.find().fetch().length)
                }
            }
        }
    }
    //if you want to clean the trashesCollection.
    //         else {
    //            var deletelength = trashesCollection.find().fetch().length;
    //            var deletedata = trashesCollection.find().fetch();
    //            var a = 0
    //
    //            for (0; i < deletelength; i++) {
    //                trashesCollection.remove(deletedata[i]._id)
    //                console.log(trashesCollection.find().fetch().length)
    //            }
    //
    //        }
};

var getGeoFlickrFotos = function (flickrGetPlaceIdUrl, flickrGetFotosUrl, flickrGetGeoFotoUrl) {
    //get place_d of amsterdam centrum
    var city = "Amsterdam",
        postCode = 1013,
        country = "Nederland",
        url = flickrGetPlaceIdUrl[0] + city + "%2C" + country + "%2C" + postCode + flickrGetPlaceIdUrl[1],
        placeID = HTTP.get(url).data.places.place[0].place_id,

        //get foto's with the placeID
        //divine min and max take date
        min_taken_date = "2015-09-01",
        max_taken_date = "2015-09-30",
        url2 = flickrGetFotosUrl[0] + min_taken_date + flickrGetFotosUrl[1] + max_taken_date + flickrGetFotosUrl[2] + placeID + flickrGetFotosUrl[3],
        fotos = HTTP.get(url2).data.photos.photo,
        amountFotos = fotos.length,

        //get geolocation of foto's
        f = 0;
    if (fotoLocationsCollection.find().fetch()[0] === undefined) {
        for (f; f < amountFotos; f++) {
            var id = fotos[f].id,
                url3 = flickrGetGeoFotoUrl[0] + id + flickrGetGeoFotoUrl[1],
                FotoGeoData = HTTP.get(url3).data,
                latitude = FotoGeoData.photo.location.latitude,
                longitude = FotoGeoData.photo.location.longitude,
                fotoLocation = {
                    "id": id,
                    "log": longitude,
                    "lat": latitude
                };
            fotoLocationsCollection.insert(fotoLocation)
        }
    }
    //if you want to clean the fotoLocationsCollection.
    //         else {
    //            var deletelength = fotoLocationsCollection.find().fetch().length;
    //            var deletedata = fotoLocationsCollection.find().fetch();
    //            var a = 0
    //
    //            for (0; i < deletelength; i++) {
    //                fotoLocationsCollection.remove(deletedata[i]._id)
    //                console.log(fotoLocationsCollection.find().fetch().length)
    //            }
    //
    //        }

}

// Listen to incoming HTTP requests, can only be used on the server
WebApp.connectHandlers.use(function (req, res, next) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    return next();
});
