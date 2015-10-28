// basic info
App.info({
    name: 'Interactive map',
    description: 'An interactive map with geo data',
    author: 'Matthias Dolstra',
    website: 'http://mdolstra.me'
});

Plugin.registerCompiler({
    filenames: ['xxx.next.css'],
    archMatching: 'web',
}, function () {
    return new CssnextCompiler(cssnextOptions)
});
//App.icons({
//  'iphone': 'icons/icon-60.png',
//  'iphone_2x': 'icons/icon-60@2x.png'
//});
//
//App.launchScreens({
//  'iphone': 'splash/Default~iphone.png',
//  'iphone_2x': 'splash/Default@2x~iphone.png'
//});

// CORS for Meteor app
App.accessRule('meteor.local/*');
// allow tiles
App.accessRule('*.openstreetmap.org/*');
App.accessRule('*.tile.thunderforest.com/*');
App.accessRule('*.basemaps.cartocdn.com/*');
