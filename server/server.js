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


rawData = HTTP.get("https://spreadsheets.google.com/feeds/list/1mkgRVyHAmTS6VhL8q74XKdsF_adAVdNvTTilJshO5pY/od6/public/values?alt=json").data;
console.log(rawData)

// Listen to incoming HTTP requests, can only be used on the server
WebApp.connectHandlers.use(function (req, res, next) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    return next();
});
