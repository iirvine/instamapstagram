var instamapper = {
	module: function() {
		var modules = {};

		return function(name) {
			if (modules[name]) {
				return modules[name];
			}

			return modules[name] = {};
		}
	}(),
}

$(document).ready(function() {
	var app = instamapper;
	var Router = app.module("RouterModule").Router;
	
	app.router = new Router();
});