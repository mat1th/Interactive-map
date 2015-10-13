// marker collection
var Markers = new Meteor.Collection('markers');
Meteor.publish("markers", function () {
    return Markers.find();
});

//trashesCollection collection
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
        //get amount of data strings
        //amountDataStrings = rawData.feed.entry.length,
        amountDataStrings = 20,
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
                url = MapQuestUrl[0] + "\"" + street.replace(" ", "%20") + houseNumber.replace(" ", "%20") + "," + city + "\"" + MapQuestUrl[1];
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
    //    } else {
    //        var deletelength = trashesCollection.find().fetch().length;
    //        var deletedata = trashesCollection.find().fetch();
    //        var a = 0
    //
    //        for (0; i < deletelength; i++) {
    //            trashesCollection.remove(deletedata[i]._id)
    //            console.log(trashesCollection.find().fetch().length)
    //        }
    //
    //    }
};


// Listen to incoming HTTP requests, can only be used on the server
WebApp.connectHandlers.use(function (req, res, next) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    return next();
});
