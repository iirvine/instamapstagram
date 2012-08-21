(function(module){

	var vent = instamapper.module('VentModule').vent;

	//=================Module==================
	module.MapModle = Backbone.Model.extend({
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
			vent.on('map:createMap', this.createMap, module);
			vent.on('map:locate', this.locate, module);

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
				function(e) { vent.trigger('map:finishedLocate', e); });

			this.map.on('locationerror', 
				function(e) { vent.trigger('map:locateError', e); });
		},
	});

	module.InstaMapperModle = module.MapModle.extend({
		getDefaultBaseLayer: function() {
			return new L.StamenTileLayer('toner');
		},
	});

	//=================Abstracts==================
	module.Feature = Backbone.Model.extend({
		addTo: function(map) {
			this.feature.addTo(map);
		},
	});

	module.Layer = Backbone.Collection.extend({
		model: module.Feature,
	});

	//=================Abstracts==================
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

	module.Picture = module.Feature.extend({
		initialize: function(options) {
			if (options.location) {
				this.location = new L.LatLng(options.location.latitude, options.location.longitude)
				this.feature = new L.Marker(this.location, 
					{ icon: new L.Icon(
						{ 
							iconUrl:options.images.thumbnail.url, 
							className:'photo',
							iconAnchor: new L.Point(),
							iconSize: new L.Point(45, 45)
						}),
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
			return 'https://api.instagram.com/v1/media/search?lat=' + this.location.lat + '&lng=' + this.location.lng + '&distance=' + this.radius
			+ "&client_id=" + 'ae4252c2e6bb4d0da14bfc091be17dc9'
		},

		parse: function(response) {
			return response.data;
		},
	});

})(instamapper.module("MapModule"))