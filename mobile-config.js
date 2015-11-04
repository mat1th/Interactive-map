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

// CORS for Meteor app
App.accessRule('meteor.local/*');
// allow tiles
App.accessRule('*.openstreetmap.org/*');
App.accessRule('*.tile.thunderforest.com/*');
App.accessRule('*.basemaps.cartocdn.com/*');
