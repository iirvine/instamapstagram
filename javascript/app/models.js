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
		this.feature = new L.marker(location, 
			{ icon: new L.divIcon({className: 'search-radius-grabber'}), draggable : true });

		this.feature.on('dragend', this.dragEnd);
		this.feature.on('drag', this.onDrag);
	},

	onDrag: function(e) {
		this.trigger('searchPin:drag', e.target._latlng);
	},

	dragEnd: function(e) {
		this.trigger('searchPin:dragEnd', e.target._latlng);
	},

	getLocation: function() {
		return this.feature.getLatLng();
	}
});

App.SearchRadius = App.Feature.extend({
	pathOptions: {
		color: '#524B4E',
		weight: 2,
		opacity: 0.5,
		fillOpacity: 0,
		clickable: false
	},

	initialize: function(options) {
		_.bindAll(this);
		this.searchPin = options.searchPin;
		this.feature = new L.Circle(this.searchPin.getLocation(), options.radius, this.pathOptions);
		this.searchPin.on('searchPin:drag', this.onDrag, this);
	},

	onDrag: function(location) {
		this.feature.setLatLng(location);
	},

	radius: function() {
		return this.feature.getRadius();
	}
});

App.Picture = App.Feature.extend({

});

App.PictureLayer = App.Layer.extend({

});



//App modules:
App.MapModule = Backbone.Model.extend({
	map: null,
	layers: [],

	defaultBaseLayer: {
		url: 'http://{s}.tile.cloudmade.com/{key}/{styleId}/256/{z}/{x}/{y}.png',
		data: { key: "721f5fe14d2a4ae5bf8ecb6412263ce2",
				styleId: 22677 }
	},

	initialize: function(options) {
		console.log('init map module...');
		_.bindAll(this);

		//do these belong here? or in calling code?
		App.vent.on('map:createMap', this.createMap, App.mapModule);
		App.vent.on('map:locate', this.locate, App.mapModule);

		//would be nice if you could pass in an array of events/method names, like
		//events ['map:createMap' : 'createMap']
		//also, need some way of unbinding stuff....
	},

	createMap: function(element, initialView) {
		this.map = L.map(element).setView(initialView.coords, initialView.zoom);
		this.addBaseLayer();
		return this.map;
	},

	addBaseLayer: function() {
		this.addLayer(this.getDefaultBaseLayer());
	},

	getDefaultBaseLayer: function() {
		return L.tileLayer(this.defaultBaseLayer.url, this.defaultBaseLayer.data);
	},

	addLayer: function(layer) {
		this.map.addLayer(layer);
	},

	locate: function(options) {
		this.map.locate({ setView: true, maxZoom: options.zoom });
		this.map.on('locationfound', 
			function(e) { App.vent.trigger('map:finishedLocate', e); });

		this.map.on('locationerror', 
			function(e) { App.vent.trigger('map:locateError', e); });
	},
});

App.InstaMapperModule = App.MapModule.extend({
	getDefaultBaseLayer: function() {
		return new L.StamenTileLayer('toner');
	},
});
