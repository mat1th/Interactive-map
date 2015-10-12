// marker collection
var Markers = new Meteor.Collection('markers');
Meteor.publish("markers", function () {
    return Markers.find();
});

//data collection
var data = new Meteor.Collection('data');
Meteor.publish("data", function () {
    return data.find();
});

var rawData = HTTP.get("https://spreadsheets.google.com/feeds/list/1mkgRVyHAmTS6VhL8q74XKdsF_adAVdNvTTilJshO5pY/od6/public/values?alt=json").data;

//create cleanData array
var cleanData = [];

//get amount of data strings
var amountDataStrings = rawData.feed.entry.length

//loop through data
for (var i = 0; i < amountDataStrings; i++) {
    var AllTrashData = rawData.feed.entry[i].content.$t,
        SplicedTrashData = AllTrashData.split(','),
        street = SplicedTrashData[3].split(':')[1],
        houseNumber = SplicedTrashData[4].split(':')[1];
    //    var fulness = array[11].split(':')[1];
    //    console.log(fulness);
    var url = "http://nominatim.openstreetmap.org/search/" + street.replace(" ", "%20") + houseNumber.replace(" ", "%20") + "Amsterdam?format=json&addressdetails=1&limit";
    var gps = HTTP.get(url).data[0];
    if (gps != undefined) {
        if (gps.lat != undefined) {
            var longitude = gps.lon,
                latitude = gps.lat;
            var cleanDataString = {
                "street": street,
                "houseNumber": houseNumber,
                "log": longitude,
                "lat": latitude
            }
            cleanData.push(cleanDataString);
        }
    }
}



// Listen to incoming HTTP requests, can only be used on the server
WebApp.connectHandlers.use(function (req, res, next) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    return next();
});
