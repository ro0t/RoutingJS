/**
*                          ,     \    /      ,
*                         / \    )\__/(     / \
*                        /   \  (_\  /_)   /   \
*     __________________/_____\__\@  @/___/_____\_________________
*     |                          |\../|                          |
*     |                           \VV/                           |
*     |                                                          |
*     |    AdaminskyRouting - 2015                               |
*     |    Author: Adam N. Viðarsson					         |
*     |    Version: 1.0                                          |
*     |                                                          |
*     |__________________________________________________________|
*                   |    /\ /      \\       \ /\    |
*                   |  /   V        ))       V   \  |
*                   |/     `       //        '     \|
*                   `              V                '
**/
;(function(window, document) {

	window.Routing = {

		path: null,
		segments: [],
		settings: {
			debug: true,
			html: '/pages/',
			fourofour: '404',
			extension: '.html',
			rootPrefix: '',
			scriptContainer: 'js-routing-scripts',
			container: 'js-routing',
			callbacks: {
				before: function(self) {

					self.log('Callbacks::before', 'Called before loading')

				},
				success: function(self) {

					// Check if document has scripts that require loading
					var scripts = document.getElementById(self.settings.scriptContainer)

					if(scripts) {
						eval(scripts.innerHTML)
					}

					self.log('Callbacks::Success', 'Finished loading')
				},
				error: function(self, exception) {

					console.error(exception)

				}
			}
		},
		routes: {
			collection: [],
			add: function( route, response ) {
				this.collection.push({ route: route, response: response })
			}
		},
		extend: function(a, b) {

			for(var key in b) {
				if(b.hasOwnProperty(key))
					a[key] = b[key]
			}

			return a

		},
		log: function( what, secondary ) {

			if( this.settings.debug ) {

				if( secondary !== undefined )
					window.console.log( what, secondary )
				else
					window.console.log( what )
			}

		},
		initialize: function( options ) {

			this.settings = this.extend( this.settings, options )
			this.path = window.location.pathname
			this.container = document.getElementById(this.settings.container)

			if(this.path.length > 1 && this.path[0] !== '/') {
				this.path = '/' + this.path
			}

			this.log('Initialize::Path', this.path)

			return this
		},

		load: function(page) {

			var self = this,
				urlToLoad = this.settings.rootPrefix + this.settings.html + page + this.settings.extension

			this.settings.callbacks.before(self)

			this.log('Load::Container', this.container)
			this.log('Load::Loading', urlToLoad)

			try {

				var r = new XMLHttpRequest()
				r.open('GET', urlToLoad, true)

				r.onreadystatechange = function() {

					if(r.readyState == 4 && r.status == 200) {
						self.container.innerHTML = r.responseText
						self.settings.callbacks.success(self)
					} else if(r.readyState == 4 && r.status == 404) {
						self.settings.callbacks.error(self, {
							status: 404,
							message: 'Could not load file ' + urlToLoad
						})
					}

				}

				r.send( null )

			} catch( exception ) {

				this.debug('Load::Error', exception)
				this.settings.callbacks.error(this, exception)

			}

		},
		run: function() {

			var matchedRoute = 0

			for(var x in this.routes.collection) {
				var r = this.routes.collection[x],
					routeMatcher = new RegExp(r.route.replace(/:[^\s/]+/g, '([\\w-]+)'));

				if(this.path.match(routeMatcher)) {
					matchedRoute = this.path.match(routeMatcher)
					matchedRoute.route = r
				}
			}

			if(matchedRoute[0].length > 1 && this.path.length > 1) {

				this.segments = matchedRoute[0].split('/')
				this.log('Run::Page', matchedRoute)
				this.log('Run::Segments', this.segments)

			} else if(matchedRoute[0].length == 1 && this.path.length == 1) {

				this.log('Run::Index', matchedRoute)

			} else {
				// 404 ERROR
				matchedRoute.route = { route: 'ERROR', response: this.settings.fourofour }
			}

			this.load( matchedRoute.route.response )

		},
		script: function( src ) {

			var self = this,
				src = this.settings.rootPrefix + src

			this.log('Script::Load', src)

			try {

				var r = new XMLHttpRequest()
				r.open('GET', src, true)

				r.onreadystatechange = function() {
					if(r.readyState == 4 && r.status == 200) {
						// Successfully loaded
						eval(r.responseText)
					} else if(r.readyState == 4 && r.status == 404) {
						self.settings.callbacks.error(self, {
							status: 404,
							message: 'Could not load script with source: ' + src
						})
					}
				}

				r.send(null)

			} catch( exception ) {

				this.log('Script::Error', exception )
				this.settings.callbacks.error(this, exception)

			}

		}

	}

})(window, document);
