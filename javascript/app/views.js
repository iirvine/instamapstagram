(function(module) {
	var MapModule = instamapper.module('MapModule');
	var vent = instamapper.module('VentModule').vent;

	module.MapView = Backbone.View.extend({
		el: "div#map",

		initialize: function(options){
			if (options.el)
				this.setElement(options.el);

			//saving a reference to mapModule, just for convenience. 
			this.mapModule = options.mapModule;

			//I'm sort of liking the app level events, but they also seem like a bit of a code
			//smell... maybe a bit more logic in the event aggregator? 
			vent.trigger('map:createMap', this.el, options.defaultView);
		},
	});

	module.InstaMapView = module.MapView.extend({
		initialize: function(options) {
			module.MapView.prototype.initialize.call(this, options);
			
			vent.on('map:finishedLocate map:locateError', 
				this.placeLocationPin, this);

			vent.trigger('map:locate', { zoom: 12 });
		},

		placeLocationPin: function(e) {
			//place pin at default view's center if locationerror
			e.type !== 'locationerror' ? this.searchPin = new MapModule.SearchPin(e.latlng)
			: this.searchPin = new MapModule.SearchPin(this.mapModule.map.getCenter())

			this.searchPin.addTo(this.mapModule.map);
			this.searchPin.on('searchPin:dragEnd', this.searchPinDragEnd, this);

			this.searchRadius = new MapModule.SearchRadius({ searchPin: this.searchPin, radius: 2500 });
			this.searchRadius.addTo(this.mapModule.map);
		},

		searchPinDragEnd: function(e) {
			var that = this;
			console.log(e);
			this.collection.location = e;
			this.collection.radius   = this.searchRadius.radius();
			this.collection.fetch({ success: function(response) 
				{ that.collection.forEach(function(picture) { picture.addTo(that.mapModule.map) }); }});
		},
	});
})(instamapper.module("MapViewModule"));