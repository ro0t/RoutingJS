/**
* Some clever comment to explain routes.js
*/
;(function() {

	var r = Routing.initialize()

	r.routes.add('/', 'index')

	r.routes.add('blog', 'overview')
	r.routes.add('blog/:id', 'single')
	
	r.routes.add('nettur/:id', 'single')

	r.run()

})()