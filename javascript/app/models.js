var App = App || {};

//Abstracts:
App.Feature = Backbone.Model.extend({

});

App.Layer = Backbone.Collection.extend({
	model: App.Feature,
});

//App classes:



//App modules:
App.MapModule = _.extend({}, {
	createMap : function(element, initialView) {
		this.map = L.map(element)
					.setView(initialView.coords, initialView.zoom);

		this.addBaseLayer();
		return this.map;
	},

	addBaseLayer : function() {
		this.addLayer(
			L.tileLayer('http://{s}.tile.cloudmade.com/{key}/{styleId}/256/{z}/{x}/{y}.png', 
			{
				key: "721f5fe14d2a4ae5bf8ecb6412263ce2",
				styleId: 22677
			}));
	},

	addLayer : function(layer) {
		layer.addTo(this.map);
	},

	locate : function(options) {
		this.map.locate({setView: true, maxZoom: options.zoom});
		this.map.on('locationfound', 
			function(e) { App.vent.trigger('map:finishedLocate', e); });

		this.map.on('locationerror', 
			function(e) { App.vent.trigger('map:locateError', e); });
	},
});

App.InstaMapperModule = _.extend(App.MapModule, {
	placeLocationPin: function(e) {
		e.type === 'locationerror' ? this.addLayer(L.marker(this.map.getCenter(), { draggable: true })) : 
		this.addLayer(L.marker(e.latlng, { draggable: true }));
	},
});