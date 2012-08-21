(function(module){
	var MapModule = instamapper.module("MapModule");
	var MapViewModule = instamapper.module("MapViewModule");
	
	module.Router = Backbone.Router.extend({
		routes: {
			"": "index"
		},

		defaultCoords: [37.8, -96],

		initialize: function() {	
			this.mapView = new MapViewModule.InstaMapView({
				mapModel    : new MapModule.InstaMapperModel(),
				collection  : new MapModule.PictureLayer(),
				searchRadius: new MapModule.SearchRadius({ location: this.defaultCoords, radius: 2500 }),
				defaultView: { coords: this.defaultCoords, zoom: 4 },
			});
		},
	});
})(instamapper.module("RouterModule"));
