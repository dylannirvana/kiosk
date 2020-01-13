'use strict';
var mcache = require('memory-cache');

let memCache = new mcache.Cache();
let cache = duration => {
  return (req, res, next) => {
	let key = "__express__" + req.originalUrl || req.url;
    let cacheContent = memCache.get(key);
    if (cacheContent) {
      res.send(cacheContent);
      return;
    } else {
      res.sendResponse = res.send;
      res.send = body => {
        memCache.put(key, body, duration * 1000);
        res.sendResponse(body);
      };
      next();
	}
  };
};

module.exports = function(app) {
	var frontend_api = require('../controllers/frontend_api');
	var backend_api = require('../controllers/backend_api');
	
	// Frontend
	app.route('/api/categories')
		.get(frontend_api.category)
		.post(frontend_api.category);
		
	app.route('/api/category')
		.get(frontend_api.category)
		.post(frontend_api.category);

	app.route('/api/products')
		.get(frontend_api.products)
		.post(frontend_api.products);

	app.route('/api/filter-list')
		.get(frontend_api.filter_list)
		.post(frontend_api.filter_list);

	app.route('/api/search')
		.get(frontend_api.search)
		.post(frontend_api.search);

	// Login

	// Admin
	app.route('/api/testing/formkey')
		.get(backend_api.form_key_testing)
		.post(backend_api.form_key_testing); //testing only please comment out when done.

	app.route('/api/user/all')
		.get(backend_api.users)
		.post(backend_api.users);

	app.route('/api/user')
		.get(backend_api.get_user)
		.post(backend_api.get_user);

	app.route('/api/user/delete')
		.get(backend_api.del_user)
		.post(backend_api.del_user);

	app.route('/api/user/create')
		.get(backend_api.users_create)
		.post(backend_api.users_create);

	app.route('/api/user/update')
		.get(backend_api.users_update)
		.post(backend_api.users_update);

	app.route('/api/login')
		.get(backend_api.user_login)
		.post(backend_api.user_login);

	app.route('/api/local/login')
		.get(backend_api.user_login_local)
		.post(backend_api.user_login_local);

	app.route('/api/reset')
		.get(backend_api.user_email)
		.post(backend_api.user_email);

	app.route('/api/reset/email/:resetlink')
		.get(backend_api.user_email)
		.post(backend_api.user_email);

	app.route('/api/slideshows/images/uploader') // this is a sample uploader. disable this after testing.
		.get(backend_api.uploader)
		.post(backend_api.uploader);

	app.route('/api/slideshows/images/upload')
		.get(backend_api.upload)
		.post(backend_api.upload);

	app.route('/api/slideshows/create')
		.get(backend_api.create)
		.post(backend_api.create);

	app.route('/api/slideshows/update/:id')
		.get(backend_api.update)
		.post(backend_api.update);

	app.route('/api/slideshows/:id')
		.get(backend_api.get)
		.post(backend_api.get);

	app.route('/api/slideshows/')
		.get(backend_api.get)
		.post(backend_api.get);

	app.route('/api/slideshows/delete/:id')
		.get(backend_api.delete)
		.post(backend_api.delete);


    // Sync
	
		app.route('/api/sync/data')
		.get(backend_api.pull_data)
		.post(backend_api.pull_data);

	app.route('/api/sync/all')
		.get(backend_api.pull_all)
		.post(backend_api.pull_all);

	app.route('/api/sync/admin')
		.get(backend_api.get_admin)
		.post(backend_api.get_admin);

	app.route('/api/sync/push/admin')
		.get(backend_api.pull_admin)
		.post(backend_api.pull_admin);

	app.route('/api/sync/push/images')
		.get(backend_api.get_images)
		.post(backend_api.get_images);

	app.route('/api/sync/images')
		.get(backend_api.pull_images)
		.post(backend_api.pull_images);

	app.route('/api/sync/slideshows')
		.get(backend_api.get_slideshows)
		.post(backend_api.get_slideshows);

	app.route('/api/sync/push/slideshows')
		.get(backend_api.pull_slideshows)
		.post(backend_api.pull_slideshows);

	app.route('/api/sync/products')
		.get(backend_api.get_products)
		.post(backend_api.get_products);

	app.route('/api/sync/push/products')
		.get(backend_api.pull_products)
		.post(backend_api.pull_products);

	app.route('/api/sync/feed')
		.get(backend_api.sync_feed)
		.post(backend_api.sync_feed);

	//Log

	app.route('/api/log/flush')
		.get(backend_api.flush_log)
		.post(backend_api.flush_log);

	app.route('/api/log/view')
		.get(backend_api.view_log)
		.post(backend_api.view_log);		


	app.route('/api/test')
		.get(frontend_api.test)
		.post(frontend_api.test);

	app.route('/api/testdata')
		.get(frontend_api.testdata)
		.post(frontend_api.testdata);


	app.route('/api/images/:imageType/:imagePath')
		.get(cache(100), backend_api.get_image)
		.post(backend_api.get_image);

};
