L.Control.Locate = L.Control.extend({
	options: {
		position: 'topright'
	},

	initialize: function(options){
		L.Util.setOptions(this, options);

	},

	onAdd: function(map) {
		var className = 'leaflet-control-locate',
			container = L.DomUtil.create('div', className);

		this._map = map;
		this._createButton('Locate Me', className, container, this._locate, this);
		return container;
	},

	_createButton: function(title, className, container, fn, context) {
		var link = L.DomUtil.create('a', className, container);
		link.href = '#';
		link.title = title;

		L.DomEvent
			.on(link, 'click', L.DomEvent.preventDefault)
			.on(link, 'click', fn, context);

		L.DomEvent.disableClickPropagation(link);
		return link;
	},

	_locate: function() {
		this._map.locate({ setView: true, maxZoom: this.options.maxZoom || 12 })
	},
});