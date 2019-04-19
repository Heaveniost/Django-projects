(function ($, Backbone, _, app) {
	var TemplateView = Backbone.View.extend({
		templateName: '',
		initialize: function () {
			this.template = _.template($(this.templateName).html());
		},
		render: function () {
			var context = this.getContext(),
			html = this.template(context);
			this.$el.html(html);
		},
		getContext: function () {
			return {};
		}
	});

	var AppRouter = Backbone.Router.extend({
		routes: {
			'': 'home'
		},
		initialize: function (options) {
			this.contentElement = '#content';
			this.current = null;
			Backbone.history.start();
		},
		home: function () {
			var view = new app.views.HomepageView({el: this.contentElement});
			this.render(view);
		},
		route: function (route, name, callback) {
			// Override default route to enforce login on every page
			var login;
			callback = callback || this[name];
			callback = _.wrap(callback, function (original) {
				var args = _.without(arguments, original);
				if (app.session.authenticated()) {
					original.apply(this, args);
				} else {
					// Show the login screen before calling the view
					$(this.contentElement).hide();
					// Bind original callback once the login is successful
					login = new app.views.LoginView();
					$(this.contentElement).after(login.el);
					login.on('done', function () {
						$(this.contentElement).show();
						original.apply(this, args);
					}, this);
					// Render the login form
					login.render();
				}
			});
			return Backbone.Router.prototype.route.apply(this, [route, name, callback]);
		},
		render: function (view) {
			if (this.current) {
				this.current.undelegateEvents();
				this.current.$el = $();
				this.current.remove();
			}
			this.current = view;
			this.current.render();
		}
	});

	var FormView = TemplateView.extend({
		events: {
			'submit form': 'submit'
		},
		errorTemplate: _.template('<span class="error"><% - msg %></span>'),
		clearErrors: function () {
			$('.error', this.form).remove();
		},
		showErrors: function (errors) {
			_.map(errors, function (fieldErrors, name) {
				var field = $(':input[name=' + name + ']', this.form),
				label = $('label[for=' + field.attr('id') + ']', this.form);
				if (label.length === 0) {
				    label = $('label', this.form).first();
				}
			function appendError(msg) {
				   label.before(this.errorTemplate({msg: msg}));
				}
				_.map(fieldErrors, appendError, this);
			}, this);
		},
		serializeForm: function (form) {
			return _.object(_.map(form.serializeArray(), function (item) {
			// Convert object to tuple of (name, value)
			return [item.name, item.value];
			}));
		},
		submit: function (event) {
			event.preventDefault();
			this.form = $(event.currentTarget);
			this.clearErrors();
		},
		failure: function (xhr, status, error) {
			var errors = xhr.responseJSON;
			this.showErrors(errors);
		},
		done: function (event) {
			if (event) {
				event.preventDefault();
			}
			this.trigger('done');
			this.remove();
		}
	});

	var HomepageView = TemplateView.extend({
		templateName: '#home-template',
	});

	var LoginView = TemplateView.extend({
		id: 'login',
		templateName: '#login-template',
		submit: function (event) {
			var data = {};
			FormView.prototype.submit.apply(this, arguments);
			data = this.serializeForm(this.form);
			$.post(app.apiLogin, data)
				.success($.proxy(this.loginSuccess, this))
				.fail($.proxy(this.failure, this));
		},
		loginSuccess: function (data) {
			app.session.save(data.token);
			this.done();
		}
	});

	app.views.HomepageView = HomepageView;
	app.views.LoginView = LoginView;

})(jQuery, Backbone, _, app);