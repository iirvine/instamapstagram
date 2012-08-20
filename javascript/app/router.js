var App = App || {};

App.Router = Backbone.Router.extend({
	routes: {
		"": "index"
	},

	initialize: function() {		
		App.vent.on('map:createMap', App.MapModule.createMap, App.MapModule);
		App.vent.on('map:locate', App.MapModule.locate, App.MapModule);

		this.mapView = new App.InstaMapView({
			mapModule: App.InstaMapperModule,
			collection: new App.PictureLayer(),
			defaultView: { coords: [37.8, -96], zoom: 4 },
		});
	},
});