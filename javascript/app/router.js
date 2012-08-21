var App = App || {};

App.Router = Backbone.Router.extend({
	routes: {
		"": "index"
	},

	initialize: function() {	
		App.mapModule = new App.InstaMapperModule();
		this.mapView = new App.InstaMapView({
			mapModule: App.mapModule,
			collection: new App.PictureLayer(),
			defaultView: { coords: [37.8, -96], zoom: 4 },
		});
	},
});