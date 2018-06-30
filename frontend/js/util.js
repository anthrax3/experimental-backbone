/**
 * Helper functions
 * 
 * */
var app = app || {};
app.setFocus = function(form) {
	//console.log('now setting focus', form);
	form.find("input:first").focus();
}

app.loadTemplate = function(filename, selector) {
	console.log("FILENAME: ",filename);
	var selector = selector || "#app";
	//var promise = new Promise();
	return new Promise(function(resolve) {
		$("<div></div>").load(filename  + "?" + Date.now(), function() {
			//console.log('div.app contents: ', $("div.app").html());
			var tempstr =  $(this).html(); //$("div.app").html();
			//console.log("template: ", tempstr);
			template = _.template(tempstr);
			//var ss = template.apply({'escape':true});
			//console.log('ss', ss);
			var html = template({users: [app.user1, app.user2]});
			//console.log('output: ', html);
			//thtml
			$ctrl = $(html);
			//console.log("jquery output: ", $ctrl.html());
			$(selector).html($ctrl.html()).show();
			//$("div.app").append("<h1>test</h1>").show();
			//if (callback != undefined) callback();
			resolve();
		});
	});
}


//setTimeout re-implemented using Promise API
app.sleep = function(interval) {
	return new Promise(function(resolve){
		setTimeout(resolve, interval);
		//resolve(100);
	});
}
