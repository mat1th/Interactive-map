# Interactive map with Meteor and the Leaflet library
[![forthebadge](http://forthebadge.com/images/badges/built-with-love.svg)](http://informotion.meteor.com)
[![forthebadge](http://forthebadge.com/images/badges/uses-html.svg)](http://informotion.meteor.com)
[![forthebadge](http://forthebadge.com/images/badges/uses-js.svg)](http://informotion.meteor.com)
[![forthebadge](http://forthebadge.com/images/badges/uses-css.svg)](http://informotion.meteor.com)

## Synopsis
This application was created as a school project for the municipality of Amsterdam. We are asked to help them in their effort to keep the city clean. We have visualized the crowds in Amsterdam Center to make a map, based on GPS location of flickr pictures taken in Amsterdam Centrum. So we can see the crowds on a GPS base. We combined this dataset with all the trashbins in Amsterdam Centrum.

## Motivation
We created this application as a school project for the municipality of Amsterdam. They asked us to make a data visualization that helps them in their effort to keep the city clean.

## Installation
Install meteor:

```bash
curl https://install.meteor.com | /bin/sh
```

Download:
https://github.com/matth96/Leaflet-with-meteor.git

Go to the project:

```bash
cd path/to/Interactive-map
```

Run meteor:
```bash
meteor
```


## Meteor packages
Name              | Version | Description
:---------------- | :-----  | :-------------------------------------------------------------------
iron:router       | 1.0.12  | Routing specifically designed for Meteor.
jquery       | 1.11.4  | Helpful client-side library
bevanhunt:leaflet | 1.2.1   | An open-source JavaScript library for mobile-friendly interactive maps.
http              | 1.1.1   | Make HTTP calls to remote servers.
infinitedg:gsap   | 1.16.0  | GreenSock Animation Platform : Professional-Grade HTML5 Animation.
kit:cssnext       | 1.0.2   | Transpile CSS4 to CSS3


## Change data
In the file [public/data/url.json](https://github.com/matth96/Interactive-map/blob/master/public/data/url.json) you can find all te urls we are using to get the data.

- RawData is the data from the trashes
- mapQuest is used to convert the street adresses to gps locations
- flickrGetPlaceId is the request url to the flickr API to get all photo's of a place id
- flickrGetPhotos is the request url to the flickr API to get all the photo id's
- flickrGetGeoPhoto is the request url to the flickr API to get the geo data from every photo.


## Contributors
 - [Avia]() for motion
 - [Niels](http://cremind.nl) for design
 - [Melvin](http://oege.ie.hva.nl/~reijnom001/testportfolio/index.html) for coding
 - [Matthias](http://mdolstra.me) for coding
 - [Shanice](http://www.shanicedesign.com) for interaction

## Screenshots

### Intro
![intro](https://raw.githubusercontent.com/matth96/Interactive-map/master/intro.png)

### Map
![intro](https://raw.githubusercontent.com/matth96/Interactive-map/master/normal.png)

### Map zoomed
![intro](https://raw.githubusercontent.com/matth96/Interactive-map/master/zoomed.png)


## License
Licensed under the  Apache License  see [LICENSE](https://github.com/matth96/Interactive-map/blob/master/LICENSE.md)

