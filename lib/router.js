Router.route('/', function () {
  this.render('home');
});

Router.route('/map', function () {
this.render('map');
});
//
//
//Router.map(function() {
//  this.route('home', {
//    path: '/',
//    template: 'home'
//  }),
//  this.route('map', {
//    path: '/map',
//    template: 'map',
//    action: function() {
//      var self = this;
//      $.getScript('/js/leaflet-heatmap.js', function(data, textStatus, jqxhr) {
//        if(jqxhr.status === 200) {
//          self.render();
//        }
//     });
//    }
//  })
//});
