(function(module) {
	var MapModule = instamapper.module('MapModule');
	var vent = instamapper.module('VentModule').vent;

	module.MapView = Backbone.View.extend({
		el: "div#map",

		initialize: function(options){
			if (!options.mapModel) throw "MapView Error: Missing MapModel";
			if (options.el)
				this.setElement(options.el);

			//saving a reference to mapModule, just for convenience. 
			this.mapModel = options.mapModel;

			//I'm sort of liking the app level events, but they also seem like a bit of a code
			//smell, just hooking up callbacks and lobbing events all over the place... 
			//maybe a bit more logic in the event aggregator?  
			vent.trigger('map:createMap', this.el, options.defaultView);
		},
	});

	module.InstaMapView = module.MapView.extend({
		initialize: function(options) {
			if(!options.searchRadius) throw "InstaMapView Error: Missing SearchRadius";
			module.MapView.prototype.initialize.call(this, options);
			
			vent.on('map:finishedLocate', this.placeSearchRadius, this);
			vent.trigger('map:locate', { zoom: 12 });

			this.searchRadius = options.searchRadius;
			this.searchRadius.addTo(this.mapModel.map);
			this.searchRadius.on('searchRadius:dragEnd', this.searchRadiusDragEnd, this)
		},

		placeSearchRadius: function(e) {
			this.searchRadius.moveTo(this.mapModel.map.getCenter());
		},

		searchRadiusDragEnd: function(e) {
			//nasty, super hacky method. needs refactoring. ugh. gross.
			var that = this;
			this.collection.radius   = this.searchRadius.radius();
			this.collection.location = e;
			this.collection.fetch({ success: function(response) 
				{ that.collection.forEach(function(picture) { picture.addTo(that.mapModel.map) }); }});
		},
	});
})(instamapper.module("MapViewModule"));