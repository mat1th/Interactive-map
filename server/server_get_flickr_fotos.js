//september fotoLocationsCollection collection
var fotoLocationsCollection = new Meteor.Collection('fotoLocationsCollection');
Meteor.publish("fotoLocationsCollection", function () {
    return fotoLocationsCollection.find();
});

//July fotoLocationsJulyCollection collection
var fotoLocationsJulyCollection = new Meteor.Collection('fotoLocationsJulyCollection');
Meteor.publish("fotoLocationsJulyCollection", function () {
    return fotoLocationsJulyCollection.find();
});

//August  fotoLocationsAugustCollection collection
var fotoLocationsAugustCollection = new Meteor.Collection('fotoLocationsAugustCollection');
Meteor.publish("fotoLocationsAugustCollection", function () {
    return fotoLocationsAugustCollection.find();
});

Meteor.startup(function () {
    HTTP.get(Meteor.absoluteUrl("data/url.json"), function (err, result) {
        if (err) {
            console.log(err);
        }
        if (result) {
            //get urls from flickr
            var flickrGetPlaceIdUrl = result.data.flickrGetPlaceId,
                flickrGetPhotosUrl = result.data.flickrGetPhotos,
                flickrGetGeoPhotoUrl = result.data.flickrGetGeoPhoto;
            getGeoFlickrPhotos(flickrGetPlaceIdUrl, flickrGetPhotosUrl, flickrGetGeoPhotoUrl);
        }
    });
});

var getGeoFlickrPhotos = function (flickrGetPlaceIdUrl, flickrGetPhotosUrl, flickrGetGeoPhotoUrl) {
    //get place_d of amsterdam centrum
    var city = "Amsterdam",
        postCode = 1013,
        country = "Nederland",
        url = flickrGetPlaceIdUrl[0] + city + "%2C" + country + "%2C" + postCode + flickrGetPlaceIdUrl[1],
        placeID = HTTP.get(url).data.places.place[0].place_id,

        //get foto's with the placeID
        //divine min and max take date
        July = {
            "min_taken_date": "2015-07-01",
            "max_taken_date": "2015-07-31"
        },
        August = {
            "min_taken_date": "2015-08-01",
            "max_taken_date": "2015-08-31"
        },
        September = {
            "min_taken_date": "2015-09-01",
            "max_taken_date": "2015-09-30"
        },
        firstPage = 1,
        url2July = flickrGetPhotosUrl[0] + July.min_taken_date + flickrGetPhotosUrl[1] + July.max_taken_date + flickrGetPhotosUrl[2] + placeID + flickrGetPhotosUrl[3] + firstPage + flickrGetPhotosUrl[4],
        url2August = flickrGetPhotosUrl[0] + August.min_taken_date + flickrGetPhotosUrl[1] + August.max_taken_date + flickrGetPhotosUrl[2] + placeID + flickrGetPhotosUrl[3] + firstPage + flickrGetPhotosUrl[4],
        url2September = flickrGetPhotosUrl[0] + September.min_taken_date + flickrGetPhotosUrl[1] + September.max_taken_date + flickrGetPhotosUrl[2] + placeID + flickrGetPhotosUrl[3] + firstPage + flickrGetPhotosUrl[4],
        photosJuly = [],
        photosAugust = [],
        photosSeptember = [];

    HTTP.get(url2July, function (err, result) {
        if (result) {
            var page = 1,
                pagesJuly = result.data.photos.pages - 1,
                totalPhotosJuly = pagesJuly * 250,
                month = "July";
            getAllFotosJuly(page, pagesJuly, totalPhotosJuly, month);
        }
    });
    HTTP.get(url2August, function (err, result) {
        if (result) {
            var page = 1,
                pagesAugust = result.data.photos.pages - 1,
                totalPhotosAugust = pagesAugust * 250,
                month = "August";
            getAllFotosAugust(page, pagesAugust, totalPhotosAugust, month);
        }
    });
    HTTP.get(url2September, function (err, result) {
        if (result) {
            var page = 1,
                pagesSeptember = result.data.photos.pages - 1,
                totalPhotosSeptember = pagesSeptember * 250,
                month = "September";
            getAllFotosSeptember(page, pagesSeptember, totalPhotosSeptember, month);
        }
    });

    //Get foto's of a month July
    var getAllFotosJuly = function (page, pagesJuly, totalPhotosJuly, month) {
        if (fotoLocationsJulyCollection.find().fetch()[0] === undefined) {

            for (page; page < pagesJuly + 1; page++) {
                //urls
                var url2July = flickrGetPhotosUrl[0] + July.min_taken_date + flickrGetPhotosUrl[1] + July.max_taken_date + flickrGetPhotosUrl[2] + placeID + flickrGetPhotosUrl[3] + page + flickrGetPhotosUrl[4];

                HTTP.get(url2July, function (err, result) {
                    if (err) {
                        console.log(err);
                    }
                    if (result) {
                        var anoumtPhotoIDs = result.data.photos.photo.length,
                            p = 0;

                        for (p; p < anoumtPhotoIDs; p++) {
                            photosJuly.push(result.data.photos.photo[p].id);
                            if (page === pagesJuly + 1) {
                                if (photosJuly.length === totalPhotosJuly) {
                                    if (p === anoumtPhotoIDs - 1) {
                                        console.log("Get geo location of July");
                                         getGeoLoctionOfPhotoIdsJuly(photosJuly);
                                    }
                                }
                            }
                        }
                    }
                });
            }
            //get geolocation of foto's
            var getGeoLoctionOfPhotoIdsJuly = function (photosJuly) {

                //loop to get gps location
                var amountPhotos = photosJuly.length,
                    f = 0;

                console.log(amountPhotos);
                for (f; f < amountPhotos; f++) {
                    var id = photosJuly[f],
                        //set url and get fotogeodata
                        url3 = flickrGetGeoPhotoUrl[0] + id + flickrGetGeoPhotoUrl[1],
                        FotoGeoData = HTTP.get(url3).data,
                        latitude = FotoGeoData.photo.location.latitude,
                        longitude = FotoGeoData.photo.location.longitude,
                        fotoLocation = {
                            "id": id,
                            "log": longitude,
                            "lat": latitude
                        };
                    fotoLocationsJulyCollection.insert(fotoLocation);
                    console.log(fotoLocationsJulyCollection.find().fetch().length);
                }
            };
        } else {
            console.log("collection of july has " + JSON.stringify(fotoLocationsJulyCollection.find().fetch().length) + " foto's");

            var deletelength = fotoLocationsJulyCollection.find().fetch().length,
                deletedata = fotoLocationsJulyCollection.find().fetch(),
                a = 0

            // uncommend this code if you want to delete the fotoLocationsJulyCollection
//              for (0; a < deletelength; a++) {
//                fotoLocationsJulyCollection.remove(deletedata[a]._id)
//                 console.log(fotoLocationsJulyCollection.find().fetch().length)
//               }
        }
    };
    var getAllFotosAugust = function (page, pagesAugust, totalPhotosAugust, month) {
        if (fotoLocationsAugustCollection.find().fetch()[0] === undefined) {
            //loop all pages
            for (page; page < pagesAugust + 1; page++) {
                //urls
                var url2August = flickrGetPhotosUrl[0] + August.min_taken_date + flickrGetPhotosUrl[1] + August.max_taken_date + flickrGetPhotosUrl[2] + placeID + flickrGetPhotosUrl[3] + page + flickrGetPhotosUrl[4];
                HTTP.get(url2August, function (err, result) {
                    if (err) {
                        console.log(err);
                    }
                    if (result) {
                        var anoumtPhotoIDs = result.data.photos.photo.length,
                            p = 0;
                        for (p; p < anoumtPhotoIDs; p++) {
                            photosAugust.push(result.data.photos.photo[p].id);
                            if (page === pagesAugust + 1) {
                                if (photosAugust.length === totalPhotosAugust - 1) {
                                    if (p === anoumtPhotoIDs - 2) {
                                        console.log("Get geo location of August")
                                        getGeoLoctionOfPhotoIdsAugust(photosAugust);

                                    }
                                }
                            }
                        }
                    }
                });
            }

            //get geolocation of foto's
            var getGeoLoctionOfPhotoIdsAugust = function (photosAugust) {
                //loop to get gps location

                var amountPhotos = photosAugust.length,
                    f = 1052;
                console.log(amountPhotos);
                for (f; f < amountPhotos; f++) {
                    var id = photosAugust[f],
                        url3 = flickrGetGeoPhotoUrl[0] + id + flickrGetGeoPhotoUrl[1],
                        FotoGeoData = HTTP.get(url3).data,
                        latitude = FotoGeoData.photo.location.latitude,
                        longitude = FotoGeoData.photo.location.longitude,
                        fotoLocation = {
                            "id": id,
                            "log": longitude,
                            "lat": latitude
                        };
                    fotoLocationsAugustCollection.insert(fotoLocation);
                    console.log(fotoLocationsAugustCollection.find().fetch().length);
                }
            };
        }
        else {
            console.log("collection of augustus has " + JSON.stringify(fotoLocationsAugustCollection.find().fetch().length) + " foto's")
            var deletelength = fotoLocationsAugustCollection.find().fetch().length,
                deletedata = fotoLocationsAugustCollection.find().fetch(),
                a = 0;

            // uncommend this code if you want to delete the fotoLocationsAugustCollection
             for (0; a < deletelength; a++) {
                 fotoLocationsAugustCollection.remove(deletedata[a]._id)
                 console.log(fotoLocationsAugustCollection.find().fetch().length)
             }
        };
    };

    var getAllFotosSeptember = function (page, pagesSeptember, totalPhotosSeptember, month) {
        if (fotoLocationsCollection.find().fetch()[0] === undefined) {
            for (page; page < pagesSeptember + 1; page++) {
                //urls
                var url2September = flickrGetPhotosUrl[0] + September.min_taken_date + flickrGetPhotosUrl[1] + September.max_taken_date + flickrGetPhotosUrl[2] + placeID + flickrGetPhotosUrl[3] + page + flickrGetPhotosUrl[4];
                HTTP.get(url2September, function (err, result) {
                    if (err) {
                        console.log(err);
                    }
                    if (result) {
                        var anoumtPhotoIDs = result.data.photos.photo.length,
                            p = 0;
                        for (p; p < anoumtPhotoIDs; p++) {
                            photosSeptember.push(result.data.photos.photo[p].id)
                            if (page === pagesSeptember + 1) {
                                if (photosSeptember.length === totalPhotosSeptember - 1) {
                                    if (p === anoumtPhotoIDs - 1) {
                                        console.log("Get geo location of September");
                                        getGeoLoctionOfPhotoIdsSeptember(photosSeptember);

                                    }
                                }
                            }
                        }
                    }
                });
            }

            //get geolocation of foto's
            var getGeoLoctionOfPhotoIdsSeptember = function (photosSeptember) {
                //loop to get gps location
                var amountPhotos = photosSeptember.length,
                    f = 1052;
                console.log(amountPhotos);
                for (f; f < amountPhotos; f++) {
                    var id = photosSeptember[f],
                        url3 = flickrGetGeoPhotoUrl[0] + id + flickrGetGeoPhotoUrl[1],
                        FotoGeoData = HTTP.get(url3).data,
                        latitude = FotoGeoData.photo.location.latitude,
                        longitude = FotoGeoData.photo.location.longitude,
                        fotoLocation = {
                            "id": id,
                            "log": longitude,
                            "lat": latitude
                        };
                    fotoLocationsCollection.insert(fotoLocation);
                    console.log(fotoLocationsCollection.find().fetch().length);
                };
            };
        }
        else {
            console.log("collection of september has " + JSON.stringify(fotoLocationsCollection.find().fetch().length) + " foto's");
            var deletelength = fotoLocationsCollection.find().fetch().length,
                deletedata = fotoLocationsCollection.find().fetch(),
                a = 0;

            // uncommend this code if you want to delete the fotoLocationsCollection
            for (0; a < deletelength; a++) {
                fotoLocationsCollection.remove(deletedata[a]._id)
                console.log(fotoLocationsCollection.find().fetch().length)
                            }
        }

    };
};
