var App = App || {};

//Abstracts:
App.Feature = Backbone.Model.extend({
	addTo: function(map) {
		this.feature.addTo(map);
	},
});

App.Layer = Backbone.Collection.extend({
	model: App.Feature,
});

//App classes:
App.SearchPin = App.Feature.extend({
	initialize: function(location) {
		_.bindAll(this);
		this.feature = new L.marker(location, { draggable : true });
		this.feature.on('dragend', this.dragEnd);
		this.feature.on('drag', this.onDrag);
	},

	onDrag: function(e) {
		this.trigger('searchPin:drag', e.target._latlng);
	},

	dragEnd: function(e) {
		this.trigger('searchPin:dragEnd', e.target._latlng);
	},
});

App.SearchRadius = App.Feature.extend({
	pathOptions: {
		color: '#524B4E',
		weight: 2,
		opacity: 0.5,
		fillOpacity: 0
	},

	initialize: function(options) {
		this.searchPin = options.searchPin;
		this.feature = new L.Circle(options.location, options.radius, this.pathOptions);

		this.searchPin.on('searchPin:drag', this.onDrag, this);
	},

	onDrag: function(location) {
		this.feature.setLatLng(location);
	},

	radius: function() {
		return this.feature.radius;
	}
});

App.PictureLayer = App.Layer.extend({

});


//App modules:
App.MapModule = _.extend({}, {
	createMap: function(element, initialView) {
		this.map = L.map(element).setView(initialView.coords, initialView.zoom);
		this.addBaseLayer();
		return this.map;
	},

	addBaseLayer: function() {
		this.addLayer(L.tileLayer('http://{s}.tile.cloudmade.com/{key}/{styleId}/256/{z}/{x}/{y}.png', 
			{
				key: "721f5fe14d2a4ae5bf8ecb6412263ce2",
				styleId: 22677
			}));
	},

	addLayer: function(layer) {
		layer.addTo(this.map);
	},

	locate: function(options) {
		this.map.locate({ setView: true, maxZoom: options.zoom });
		this.map.on('locationfound', 
			function(e) { App.vent.trigger('map:finishedLocate', e); });

		this.map.on('locationerror', 
			function(e) { App.vent.trigger('map:locateError', e); });
	},
});

App.InstaMapperModule = _.extend(App.MapModule, {

});
