var App = App || {};

App.MapView = Backbone.View.extend({
	el: "div#map",

	initialize: function(options){
		if (options.el)
			this.setElement(options.el);

		this.mapModule = options.mapModule;
		App.vent.trigger('map:createMap', this.el, options.defaultView);
	},
});

App.InstaMapView = App.MapView.extend({
	initialize: function(options) {
		App.MapView.prototype.initialize.call(this, options);
		
		App.vent.on('map:finishedLocate map:locateError', 
			this.placeLocationPin, this);

		App.vent.trigger('map:locate', { zoom: 12 });
	},

	placeLocationPin: function(e) {
		e.type !== 'locationerror' ? this.searchPin = new App.SearchPin(e.latlng)
		: this.searchPin = new App.SearchPin(this.mapModule.map.getCenter())

		this.searchPin.addTo(this.mapModule.map);
		this.searchPin.on('searchPin:dragEnd', this.searchPinDragEnd, this);

		this.searchRadius = new App.SearchRadius({ location: e.latlng, searchPin: this.searchPin, radius: 2500 });
		this.searchRadius.addTo(this.mapModule.map);
	},

	searchPinDragEnd: function(e) {
		console.log(e);
		console.log(this.searchRadius.get('radius'));
	},
});