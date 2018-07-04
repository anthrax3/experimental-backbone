/**
 * Views
 * 
 * */
var app = app || {};
console.log("loading views");

app.NavbarView = Backbone.View.extend({
	el: "#div-navbar",
	initialize: function() {
		var temp = this;
		$.get("partials/navbar.html", function(e){
			temp.template = _.template(e, {});
			app.bus.trigger('navbarView:ontemplateload');
			console.log('%cnavbarView:ontemplateload','color:darkblue');
		});
	},
	waitforTemplate: function(c) {
		if (!this.template) {
			console.log("%cnavbar template hasn't loaded yet.", "color:darkblue");
			this.listenTo(app.bus, 'navbarView:ontemplateload', function() {
				c();
			});
		} else { c(); }
	},
	render: function() {
		var t = this;
		this.waitforTemplate(function() {
			t.$el.html(t.template());
			app.bus.trigger('navbarView:onrender');
		});
	},
	update: function(data) {
		var t = this;
		this.waitforTemplate(function(){
			console.log("%cnavbarView:onupdatestart","color:darkblue");
			var icon = data.icon || "bug";
			$("#icon-title").removeClass();
			$("#icon-title").addClass("fa fa-" + icon);
			$("#spn-title").text(data.title);
		});
	},
	alert: function(message, flag) {
		var flag = flag || "success";
		var closeAnchor = '<a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>';
		var html = '<div class="alert alert-' + flag +  '">' + closeAnchor + message + '</div>';
		this.$el.find("#nav-alert-block").html(html);
		//$("#div-main").append(html);
	},
	clearAlerts: function() {
		this.$el.find("#nav-alert-block").html("");
	}
});

app.TestView = Backbone.View.extend({
	el: "#div-main",
	title: 'Test Page',
	render: function(){
		title = this.title;
		app.loadTemplate("partials/test.html")
		.then(function() {
			app.bus.trigger("view:rendered", {title: title, icon: 'file'});
			console.log("test page loaded");
		});
	},
});

app.AboutView = Backbone.View.extend({
	el: "#div-main",
	title: "About ",
	render: function() {
		this.title = "About " + app.config.name;
		var temp = this;
		title = this.title;
		app.loadTemplate("partials/about.html")
		.then(function() {
			app.bus.trigger("view:rendered", {title: title, icon: 'info-circle'});			
		});
	},
});

app.HomeView = Backbone.View.extend({
	el: "#div-main",
	title: 'Home',
	render: function(){
		var temp = this;
		title = this.title;
		app.loadTemplate("partials/home.html")
		.then(function() {
			app.bus.trigger("view:rendered", {title: title, icon: 'bug'});
			var ss = "";
			ss += "Application Configuration: <br>";
			ss += _.template("<pre><%= content %></pre>")({"content": JSON.stringify(app.config)});
			ss += "Application State: <br>";
			ss += _.template("<pre><%= content %></pre>")({"content": JSON.stringify(app.state)});
			temp.$el.find("#div-info").html(ss);
			if (app.state.justLoggedIn) {
				app.state.justLoggedIn = false;
				var welcome = "Welcome " + app.state.user.name + "!";
				app.navbarView.alert(welcome);
				app.dbs.saveState();
			}
		});
	},
});

app.LoginView = Backbone.View.extend({
	el: '#div-main',
	title: "Login",
	initialize: function(){
		const temp = this;
		$.get("partials/login.html", function(e) {
			temp.template = _.template(e, {});
			app.bus.trigger("loginView:ontemplateload");
		});
	},
	events: {
		"submit #frm-login": function() {
			console.log("Form submitted!");
			app.bus.trigger("login:start", {
				data: {
					"email": this.$el.find("#email").val(),
					"password": this.$el.find("#password").val(),
				},
				success: function(data) {
					if (!data) {
						app.bus.trigger('alert', "Incorrect Email/Password.", 'danger');
					}
					else {
						//~ app.router.navigate("#", {'trigger':true});
						//sign-in successful
						app.navbarView.render();
						app.router.navigate("#", {'trigger':true});
					}
				}
			});
		}
	},
	render: function() {
		if (!this.template) {
			console.log("%clogin template hasn't loaded yet", "color:darkblue");
			this.listenTo(app.bus, "loginView:ontemplateload", function() {
				this.render();
			});
			return;
		}
		app.signout();
		title = this.title;
		app.navbarView.render();
		console.log("login template loaded");
		this.$el.html(this.template({}));
		app.bus.trigger("view:rendered", {title: title, icon: 'user'});
		var $form = this.$el.find("#frm-login");
		app.setFocus($form);
	},
});

app.RegisterView = Backbone.View.extend({
	el: '#div-main',
	title: "Register",
	initialize: function() {
		const temp = this;
		$.get("partials/register.html", function(e){
			//console.log('loading temploate: ', e);
			temp.template = _.template(e, {});
			app.bus.trigger("registerView:ontemplateload");
		});
	},
	events: {
		"submit #frm-register": function(event) {
			console.log('called');
			var pwd = this.$el.find("#password").val() ;
			var cnf = this.$el.find("#confirm").val() ;
			if (pwd !== cnf) {
				app.bus.trigger('alert', "New and confirm passwords should match.", 'danger');
				return;
			}
			app.bus.trigger("register", {
				data: {
					'type': 'Admin',
					'name': this.$el.find("#name").val(),
					'email': this.$el.find("#email").val(),
					'password': this.$el.find("#password").val(),
					'confirm': this.$el.find("#confirm").val(),
				},
				success: function(data){
					//console.log('Data Received from server! ', data);
					if (data) {
						app.bus.trigger('alert', "You have successfully registered! <a href='#login'>Click here</a> to login.");
					} else {
						app.bus.trigger('alert', "There was some problem during registration. Account with this email may already exist.", 'danger');
					}
				}
			});
		}
	},
	render: function() {
		if (!this.template) {
			console.log("register template not loaded yet");
			this.listenTo(app.bus, "registerView:ontemplateload", function() {
				this.render();
			});
			return;
		}
		app.signout();
		title = this.title;
		app.navbarView.render();
		this.$el.html(this.template({}));
		app.bus.trigger("view:rendered", {title: this.title, icon: 'register'});
		$form = this.$el.find("#frm-register");
		app.setFocus($form);
	},
});


app.loginView = new app.LoginView();
app.registerView = new app.RegisterView();
app.navbarView = new app.NavbarView();
app.homeView = new app.HomeView();
app.testView = new app.TestView();
app.aboutView = new app.AboutView();
