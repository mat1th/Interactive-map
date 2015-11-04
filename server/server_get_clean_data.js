//trashesCollection collection
var trashesCollection = new Meteor.Collection('trashesCollection');
Meteor.publish("trashesCollection", function () {
    return trashesCollection.find();
});

var rawDataUrl,
    mapQuestUrl;

//Loads data from url.json
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
        //get amount of data strings
        amountDataStrings = rawData.feed.entry.length;
    loopfunction = function (i) {
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
        //starts with looping from the last point, and adds the the new points
        var i = trashesCollection.find().fetch().length;
        console.log('amountDataStrings > database')
        loopfunction(i)
    }
    //If there are fewer points in the collection than in amountDataStrings, it will delete everything and start over
    if (amountDataStrings < trashesCollection.find().fetch().length) {
        console.log('amountDataStrings < database')

        var deletelength = trashesCollection.find().fetch().length,
            deletedata = trashesCollection.find().fetch(),
            a = 0,
            i = 0;

        for (0; i < deletelength; i++) {
            trashesCollection.remove(deletedata[i]._id)
            console.log(trashesCollection.find().fetch().length)
            if (deletelength === 0) {
                loopfunction(i)
            }
        }
    }
    if (amountDataStrings === trashesCollection.find().fetch().length) {
        if (trashesCollection.find().fetch()[0] === undefined) {
            var i = 0;
            loopfunction(i)
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