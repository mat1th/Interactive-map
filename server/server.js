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

//
//// define our function with the callback argument
//function cleanData(arg1, arg2, callback) {
//    // this generates a random number between
//    // arg1 and arg2
//    var my_number = Math.ceil(Math.random() *
//        (arg1 - arg2) + arg2);
//    // then we're done, so we'll call the callback and
//    // pass our result
//    callback(my_number);
//}
//// call the function
//some_function(5, 15, function (num) {
//    // this anonymous function will run when the
//    // callback is called
//    console.log("callback called! " + num);
//});



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
     cleanData.push(cleanDataString);
}

console.log(cleanData)

// Listen to incoming HTTP requests, can only be used on the server
WebApp.connectHandlers.use(function (req, res, next) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    return next();
});
