//trashesCollection collection
var trashesCollection = new Meteor.Collection('trashesCollection');
Meteor.publish("trashesCollection", function () {
    return trashesCollection.find();
});




var rawDataUrl,
    mapQuestUrl;

Meteor.startup(function () {
    HTTP.get(Meteor.absoluteUrl("data/url.json"), function (err, result) {
        if (err) {
            console.log(err);
        }
        if (result) {
            var rawDataUrl = result.data.rawData,
                mapQuestUrl = result.data.mapQuest;
            getCleanData(rawDataUrl, mapQuestUrl);
        }
    });
});

//get geo data of trashes
var getCleanData = function (rawDataUrl, mapQuestUrl) {
    var rawData = HTTP.get(rawDataUrl).data,
        //        //create cleanData array
        //        //get amount of data strings
        amountDataStrings = rawData.feed.entry.length;
    loopfuntion = function (i) {
        for (i; i < amountDataStrings; i++) {
            var AllTrashData = rawData.feed.entry[i].content.$t,
                SplicedTrashData = AllTrashData.split(','),
                city = "Amsterdam",
                street = SplicedTrashData[3].split(':')[1],
                houseNumber = SplicedTrashData[4].split(':')[1],
                url = mapQuestUrl[0] + "\"" + street.replace(" ", "%20") + houseNumber.replace(" ", "%20") + "," + city + "\"" + mapQuestUrl[1],
                gps = HTTP.get(url).data;

            if (gps !== undefined) {
                if (gps.results[0].locations[0].latLng !== undefined) {
                    var longitude = gps.results[0].locations[0].latLng.lng,
                        latitude = gps.results[0].locations[0].latLng.lat,
                        cleanDataString = {
                            "street": street,
                            "houseNumber": houseNumber,
                            "log": longitude,
                            "lat": latitude
                        };
                    trashesCollection.insert(cleanDataString);
                    console.log(trashesCollection.find().fetch().length);
                }
            }
        }
    };

    //loop through data
    if (amountDataStrings > trashesCollection.find().fetch().length) {
        //starts with looping at ending point
        var i = trashesCollection.find().fetch().length;
        console.log('amountDataStrings > database')
        loopfuntion(i)
    }
    if (amountDataStrings < trashesCollection.find().fetch().length) {
        console.log('amountDataStrings < database')
            //if you want to clean the trashesCollection.

        var deletelength = trashesCollection.find().fetch().length,
            deletedata = trashesCollection.find().fetch(),
            a = 0,
            i = 0;
        loopfuntion(i)

        for (0; i < deletelength; i++) {
            trashesCollection.remove(deletedata[i]._id)
            console.log(trashesCollection.find().fetch().length)
            if (deletelength === 0) {
                loopfuntion(i)
            }
        }
    }
    if (amountDataStrings === trashesCollection.find().fetch().length) {
        if (trashesCollection.find().fetch()[0] === undefined) {
            var i = 0;
            loopfuntion(i)
             console.log('database = 0')
        } else {
            console.log('amountDataStrings === database')
        }
    }
};

// Listen to incoming HTTP requests, can only be used on the server
WebApp.connectHandlers.use(function (req, res, next) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    return next();
});
