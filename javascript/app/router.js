(function(module){
	var MapModule = instamapper.module("MapModule");
	var MapViewModule = instamapper.module("MapViewModule");
	
	module.Router = Backbone.Router.extend({
		routes: {
			"": "index"
		},

		initialize: function() {	
			this.mapView = new MapViewModule.InstaMapView({
				mapModule: new MapModule.InstaMapperModle(),
				collection: new MapModule.PictureLayer(),
				defaultView: { coords: [37.8, -96], zoom: 4 },
			});
		},
	});
})(instamapper.module("RouterModule"));
