(function(module){

	var vent = instamapper.module('VentModule').vent;

	//=================Module==================
	//Feel like I'm falling prey to the temptation to MODEL ALL THE THINGS... does the map handler really need to be a model, or
	//can it just be a *module*? all it's really doing is acting like a facade for Leaflet....
	module.MapModel = Backbone.Model.extend({
		map: null,
		layers: [],

		defaultBaseLayer: {
			url: 'http://{s}.tile.cloudmade.com/{key}/{styleId}/256/{z}/{x}/{y}.png',
			data: { key: "721f5fe14d2a4ae5bf8ecb6412263ce2",
					styleId: 22677 }
		},

		initialize: function(options) {
			_.bindAll(this);

			//do event hook ups belong here? or in calling code?
			//would be nice if you could pass in an array of events/method names, like
			//events ['map:createMap' : 'createMap']
			//also, need some way of unbinding stuff....
			vent.on('map:createMap', this.createMap, module);
		},

		createMap: function(element, initialView) {
			this.map = L.map(element).setView(initialView.coords, initialView.zoom);
			this.map.on('load', vent.trigger('map:ready'));
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
	});

	module.InstaMapperModel = module.MapModel.extend({
		popupContent: '<p>Drag me!</p>',

		initialize: function(options) {
			module.MapModel.prototype.initialize.call(this, options);
			vent.on('map:ready', this.onMapReady, this);
		},

		onMapReady: function() {
			this.addControl(new L.Control.Locate());
			this.map.on('locationfound', function(e) { vent.trigger('map:finishedLocate', e); });
			this.map.on('locationerror', function(e) { vent.trigger('map:locateError', e); });
		},

		addControl: function(control) {
			this.map.addControl(control);
		},

		getDefaultBaseLayer: function() {
			return new L.StamenTileLayer('toner');
		},

		showInitPopup: function(location) {
			this.map.openPopup(L.popup({
				closeButton: false,
				offset: L.point(2, 1)
			}).setContent(this.popupContent).setLatLng(location));
			vent.on('searchPin:drag', this.closePopup, this);
		},

		closePopup: function(){
			this.map.closePopup();
			vent.off('searchPin:drag', this.closePopup);
			//blah.
		},
	});

	//=================Abstracts==================
	module.Feature = Backbone.Model.extend({
		moveTo: function(location){
			this.feature.setLatLng(location);
		},

		addTo: function(map) {
			this.feature.addTo(map);
		},
	});

	module.Layer = Backbone.Collection.extend({
		model: module.Feature,
	});

	//=================App Classes==================
	module.SearchPin = module.Feature.extend({
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

	module.SearchRadius = module.Feature.extend({
		pathOptions: {
			color: '#524B4E',
			weight: 2,
			opacity: 0.5,
			fillOpacity: 0,
			clickable: false
		},

		initialize: function(options) {
			_.bindAll(this);
			//sort of a hack. paths aren't draggable out of the box in leaflet, so SearchRadius uses an internal marker 
			//as a "grabber" and routes the drag and dragEnd events back to the view
			this.searchPin = new module.SearchPin(options.location);
			this.feature = new L.Circle(this.searchPin.getLocation(), options.radius, this.pathOptions);
			this.searchPin.on('searchPin:drag', this.onDrag, this);
			this.searchPin.on('searchPin:dragEnd', this.onDragEnd, this);
		},

		onDrag: function(location) {
			this.feature.setLatLng(location);
			vent.trigger('searchPin:drag');
		},

		onDragEnd: function(e){
			this.trigger('searchRadius:dragEnd', e);
		},

		radius: function() {
			return this.feature.getRadius();
		},

		//Override from base module.Feature
		moveTo: function(location) {
			this.searchPin.moveTo(location);
			this.feature.setLatLng(location);
		},

		addTo: function(map){
			module.Feature.prototype.addTo.call(this, map);
			this.searchPin.addTo(map);
		},

		getLocation: function() {
			return this.searchPin.getLocation();
		},
	});

	module.Picture = module.Feature.extend({
		getIcon: function (url) {
			return new L.Icon({
				iconUrl: url, 
				className:'photo',
				iconAnchor: new L.Point(),
				iconSize: new L.Point(50, 50)});
		},

		initialize: function(options) {
			if (options.location) {
				this.location = new L.LatLng(options.location.latitude, options.location.longitude)
				this.feature = new L.Marker(this.location, { 
					icon: this.getIcon(options.images.thumbnail.url), 
					draggable: true 
				});
			}
		},
	});

	module.PictureLayer = module.Layer.extend({
		model: module.Picture,

		sync: function(method, modle, options) {
			var params = _.extend({
				type: 'GET',
				dataType: 'jsonp',
				url: this.url(),
				jsonp: 'callback'
			}, options);
			return $.ajax(params);
		},

		url: function(location, radius){
			//this needs a bit of cleanup. client ID is hard-coded, and all these parameters
			//get set in kind of a stupid way in the view.
			return 'https://api.instagram.com/v1/media/search?lat=' + this.location.lat + '&lng=' + this.location.lng + '&distance=' + this.radius
			+ "&client_id=" + 'ae4252c2e6bb4d0da14bfc091be17dc9'
		},

		parse: function(response) {
			return response.data;
		},
	});

})(instamapper.module("MapModule"))