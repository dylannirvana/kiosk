'use strict';

var   formidable  = require('formidable');
let   helper      = require('../helper/response');
var   fs          = require('fs');
let   crypto      = require('./crypto');

const bucket_name = 'slideshows';
var   couchbase   = require('couchbase');
let   config      = require('../etc/config');
var   cluster     = new couchbase.Cluster(config.get_cb_server());

cluster.authenticate(config.get_cb_username(), config.get_cb_password());
var   bucket       = cluster.openBucket(bucket_name);
var   adminBucket       = cluster.openBucket('admin');

var   html_form   = '<html>'
				  + '<head>'
				  + '<title>Simple Upload Example</title>'
				  + '</head>'
				  + '<body>'
				  + '<form action="/api/slideshows/images/upload?user=gauge&formkey=02594cb1ee2f8fcabc5ccd063f1f92dcb73eea545e8113ae9fd0" enctype="multipart/form-data" method="post">'
				  + '<input type="file" name="upload" multiple>'
				  + '<input type="submit" value="Upload">'
				  + '</form>'
				  + '</body>'
				  + '</html>';

// Note: dont forget to add slideshows bucket

////////////////////////////////////////////////////////////////////////////////////////////////////////////

async function _create_slideshow (req, res, username='', formkey='', data='') {
	var qs  = 'INSERT INTO `slideshows` ( KEY, VALUE ) VALUES ( UUID(), '
			+ ''+data+' );';
	var q = couchbase.N1qlQuery.fromString(qs);

	q.consistency(couchbase.N1qlQuery.Consistency.REQUEST_PLUS);

	await bucket.query(q, function(err, rows) {	

	    if (!err) {
    		res.writeHead(200, {"Content-Type": 'application/json'});
			res.end(JSON.stringify({ code: 200, result : {"Type":"Results","Output":"Slideshow Added."}}));
	    } else {
	        setTimeout(function() {
	        	console.log(err);
	        	// _create_slideshow (req, res, username, formkey, data);
	        }, 1000);
	    }
	});
};

async function _pre_create_slideshow (req, res, username='', formkey='', data='') {

	var qs = 'SELECT meta(tbl).id, tbl.acl_type FROM `admin` tbl WHERE tbl.username =\''+username+'\' AND tbl.form_key =\''+formkey+'\' LIMIT 1';
	var q = couchbase.N1qlQuery.fromString(qs);
	q.consistency(couchbase.N1qlQuery.Consistency.REQUEST_PLUS);

	await adminBucket.query(q, function(err, rows) {	
	    if (!err) {
	    	if(rows.length==1){
		    	if(rows[0].id==null){
		    		helper.not_authorized(req, res);
		    	}else{
		    		_create_slideshow (req, res, username, formkey, data);
		    	}
			} else {
				helper.not_authorized(req, res);
			}
	    } else {
	        setTimeout(function() {
	        	_pre_create_slideshow (req, res, username, formkey, data);
	        }, 1000);
	    }
	});

};

function _pre_check_slideshow_create(req, res){
	var parms = helper.get_parms(req);
	if(parms!=null){
		if(crypto.is_allowed(parms.formkey)==true && parms.user != null && parms.data != null){
			_pre_create_slideshow(req, res, parms.user, parms.formkey, parms.data);
		}else{
			helper.not_authorized(req, res);
		}
	}else{
		helper.not_authorized(req, res);
	}
}
////////////////////////////////////////////////////////////////////////////////////////////////////////////

async function _update_slideshow (req, res, username='', formkey='', id='', data='') {
	console.log('_update_slideshow', data)

	var qs  = 'INSERT INTO `slideshows` ( KEY, VALUE ) VALUES ( \''+id+'\', '
			+ ''+data+' );';
	var q = couchbase.N1qlQuery.fromString(qs);

	q.consistency(couchbase.N1qlQuery.Consistency.REQUEST_PLUS);

	await bucket.query(q, function(err, rows) {	
		console.log('trying to update slideshow maybee?', err, rows)

	    if (!err) {
    		res.writeHead(200, {"Content-Type": 'application/json'});
			res.end(JSON.stringify({ code: 200, result : {"Type":"Results","Output":"Slideshow Updated."}}));
	    } else {
	        setTimeout(function() {
	        	console.log(err);
	        	_update_slideshow (req, res, username, formkey, id, data);
	        }, 1000);
	    }
	});
};

async function _delete_update_slideshow (req, res, username='', formkey='', id='', data='') {

	var qs  = 'DELETE from `slideshows` where meta(`slideshows`).id = \''+id+'\'';
	var q = couchbase.N1qlQuery.fromString(qs);

	q.consistency(couchbase.N1qlQuery.Consistency.REQUEST_PLUS);

	await bucket.query(q, function(err, rows) {	
		console.log('trying to delete for some reason?', err)

	    if (!err) {
    		_update_slideshow (req, res, username, formkey, id, data);
	    } else {
	        setTimeout(function() {
	        	_delete_update_slideshow (req, res, username, formkey, id, data);
	        }, 1000);
	    }
	});
};

async function _pre_update_slideshow (req, res, username='', formkey='', id='', data='') {

	var qs = 'SELECT meta(tbl).id, tbl.acl_type FROM `admin` tbl WHERE tbl.username =\''+username+'\' AND tbl.form_key =\''+formkey+'\' LIMIT 1';
	var q = couchbase.N1qlQuery.fromString(qs);
	q.consistency(couchbase.N1qlQuery.Consistency.REQUEST_PLUS);

	await bucket.query(q, function(err, rows) {	
	    if (!err) {
	    	if(rows.length==1){
		    	if(rows[0].id==null){
		    		helper.not_authorized(req, res);
		    	}else{
		    		_delete_update_slideshow (req, res, username, formkey, id, data);
		    	}
			} else {
				helper.not_authorized(req, res);
			}
	    } else {
	        setTimeout(function() {
	        	_pre_update_slideshow (req, res, username, formkey, id, data);
	        }, 1000);
	    }
	});

};

function _pre_check_slideshow_update(req, res){
	var parms = helper.get_parms(req);
	console.log('trying to update', parms)
	if(parms!=null){
		if(crypto.is_allowed(parms.formkey)==true && parms.user != null && parms.data != null && req.params.id != null){
			_pre_update_slideshow(req, res, parms.user, parms.formkey, req.params.id, parms.data);
		}else{
			helper.not_authorized(req, res);
		}
	}else{
		helper.not_authorized(req, res);
	}
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////

async function _slideshow_select (req, res, id='') {

	var where_condition = '';
	if(id!=''){
		where_condition = ' WHERE meta(tbl).id = \''+id+'\''
	}
	var qs = 'SELECT meta(tbl).id, tbl.* FROM `slideshows` tbl '+where_condition+';'
	var q = couchbase.N1qlQuery.fromString(qs);
	q.consistency(couchbase.N1qlQuery.Consistency.REQUEST_PLUS);

	await bucket.query(q, function(err, rows) {	
	    if (!err) {
	    	var returned_val = []
	    	for (var i = 0; i <= rows.length - 1; i++) {
	    		returned_val[i] = rows[i];
			}	    		
			res.writeHead(200, {"Content-Type": 'application/json'});
			res.end(JSON.stringify({ code: 200, result : {"Type":"Results","Output":{"slideshows":returned_val}}}));
	    } else {
	        setTimeout(function() {
	        	_slideshow_select (req, res, user, formkey, acl_type, name, email, user_name, password, re_password);
	        }, 1000);
	    }
	});

};

function _pre_slideshow_select (req, res){
	console.log(crypto.encrypt('none'))
	var parms = helper.get_parms(req);
	if(parms!=null){
		_slideshow_select (req, res, req.params.id);
	}else{
		helper.not_authorized(req, res);
	}
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////

async function _delete_slideshow (req, res, username='', formkey='', id='') {

	var qs  = 'DELETE from `slideshows` where meta(`slideshows`).id = \''+id+'\'';
	var q = couchbase.N1qlQuery.fromString(qs);

	q.consistency(couchbase.N1qlQuery.Consistency.REQUEST_PLUS);

	await bucket.query(q, function(err, rows) {	
	    if (!err) {
    		res.writeHead(200, {"Content-Type": 'application/json'});
			res.end(JSON.stringify({ code: 200, result : {"Type":"Results","Output":"Slideshow deleted."}}));
	    } else {
	        setTimeout(function() {
	        	_delete_slideshow (req, res, username, formkey, id);
	        }, 1000);
	    }
	});
};

async function _pre_delete_slideshow (req, res, username='', formkey='', id='') {

	var qs = 'SELECT meta(tbl).id, tbl.acl_type FROM `admin` tbl WHERE tbl.username =\''+username+'\' AND tbl.form_key =\''+formkey+'\' LIMIT 1';
	var q = couchbase.N1qlQuery.fromString(qs);
	q.consistency(couchbase.N1qlQuery.Consistency.REQUEST_PLUS);

	await bucket.query(q, function(err, rows) {	
	    if (!err) {
	    	if(rows.length==1){
		    	if(rows[0].id==null){
		    		helper.not_authorized(req, res);
		    	}else{
		    		_delete_slideshow (req, res, username, formkey, id);
		    	}
			} else {
				helper.not_authorized(req, res);
			}
	    } else {
	        setTimeout(function() {
	        	_pre_delete_slideshow (req, res, username, formkey, id);
	        }, 1000);
	    }
	});

};

function _pre_check_slideshow_delete(req, res){
	var parms = helper.get_parms(req);
	if(parms!=null){
		if(crypto.is_allowed(parms.formkey)==true && parms.user != null && req.params.id != null){
			_pre_delete_slideshow(req, res, parms.user, parms.formkey, req.params.id);
		}else{
			helper.not_authorized(req, res);
		}
	}else{
		helper.not_authorized(req, res);
	}
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////

function _uploader_form (req, res) {
	res.writeHead(200, {"Content-Type": 'text/html'});
	res.end(html_form);
};

async function _uploader (req, res) {
	if(req.method == 'POST'){

		//console.log(req);

	    var form = new formidable.IncomingForm();
	    var folder = (Math.floor(new Date() / 1000)).toString();

	    form.parse(req);

	    fs.mkdirSync('./media/images/ss/' + folder);

	    await form.on('fileBegin', function (name, file){
	    	//console.log('Started ' + file.name);
	        file.path = './media/images/ss/' + folder + '/' + file.name;
	    })
	    await form.on('file', function (name, file){
	        //console.log('Uploaded ' + file.name);
	    })
	    await form.on('end', function() {
			fs.readdir('./media/images/ss/' + folder, (err, files) => {
				var re_files = [];
				//console.log(files.length);
				for (var i = 0; i <= files.length - 1; i++) {
					re_files[i] = '/images/ss/' + folder + '/' + encodeURIComponent(files[i]);
				}
				res.writeHead(200, {"Content-Type": 'application/json'});
				res.end(JSON.stringify({ code: 200, result : {"Type":"Results","Output": re_files}}));
			});
	    	
		});
	}else{
		res.writeHead(500, {"Content-Type": 'application/json'});
		res.end(JSON.stringify({ code: 200, result : {"Type":"Error","Output":'Bad upload data'}}));
	}
};

async function _pre_upload_slideshow (req, res, username='', formkey='') {

	var qs = 'SELECT meta(tbl).id, tbl.acl_type FROM `admin` tbl WHERE tbl.username =\''+username+'\' AND tbl.form_key =\''+formkey+'\' LIMIT 1';
	var q = couchbase.N1qlQuery.fromString(qs);
	q.consistency(couchbase.N1qlQuery.Consistency.REQUEST_PLUS);

	await bucket.query(q, function(err, rows) {	
	    if (!err) {
	    	if(rows.length==1){
		    	if(rows[0].id==null){
		    		helper.not_authorized(req, res);
		    	}else{
		    		_uploader (req, res);
		    	}
			} else {
				helper.not_authorized(req, res);
			}
	    } else {
	        setTimeout(function() {
	        	_pre_upload_slideshow (req, res, username, formkey);
	        }, 1000);
	    }
	});

};

function _pre_check_slideshow_upload(req, res){
	var parms = helper.get_parms(req);
	if(parms!=null){
		if(crypto.is_allowed(parms.formkey)==true && parms.user != null){
			_pre_upload_slideshow(req, res, parms.user, parms.formkey);
		}else{
			helper.not_authorized(req, res);
		}
	}else{
		helper.not_authorized(req, res);
	}
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////


module.exports = {
	uploader : (req, res) => {
		_uploader_form(req,res);
	},
	upload : (req, res) => {
		_pre_check_slideshow_upload(req, res);
	},
	create : (req, res) => {
		_pre_check_slideshow_create(req, res);
	},
	update : (req, res) => {
		_pre_check_slideshow_update(req, res);
	},
	get : (req, res) => {
		_pre_slideshow_select(req, res);
	},
	delete : (req, res) => {
		_pre_check_slideshow_delete(req, res);
	},
}