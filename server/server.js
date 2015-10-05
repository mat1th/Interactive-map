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
    var AllTrashData = rawData.feed.entry[i].content.$t
    var SplicedTrashData = AllTrashData.split(',');
    var street = SplicedTrashData[3].split(':')[1];
    var houseNumber = SplicedTrashData[4].split(':')[1];
    //    var fulness = array[11].split(':')[1];
    //   console.log(fulness)

    //create string
    var cleanDataString = {
        "street": street,
        "houseNumber": houseNumber
    }

}
console.log(cleanData)



// Listen to incoming HTTP requests, can only be used on the server
WebApp.connectHandlers.use(function (req, res, next) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    return next();
});
