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
	var RouterModule = instamapper.module("RouterModule");
	new RouterModule.Router();
});