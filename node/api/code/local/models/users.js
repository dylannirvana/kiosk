'use strict';

let   crypto      = require('./crypto');
let   helper      = require('../helper/response');
let   emailer     = require('../helper/emailer');
const bucket_name = 'admin';
var   couchbase   = require('couchbase');
let   config      = require('../etc/config');
var   cluster     = new couchbase.Cluster(config.get_cb_server());
cluster.authenticate(config.get_cb_username(), config.get_cb_password());
var   bucket       = cluster.openBucket(bucket_name);

async function _update_all_users_formkeys_testing (req, res, formkey) {

	var qs = 'update admin set form_key = \''+formkey+'\'';
	var q = couchbase.N1qlQuery.fromString(qs);

	q.consistency(couchbase.N1qlQuery.Consistency.REQUEST_PLUS);
	try {
		var req = await bucket.query(q);
		req.on('error', function(err) {
			setTimeout(function() {
				_update_all_users_formkeys_testing (req, res);
			}, 5000);
		});
		req.on('end', function(meta) {
			res.writeHead(200, {"Content-Type": 'application/json'});
			res.end(JSON.stringify({ code: 200, result : {"Type":"Results","Output":formkey}}));
		});
	}
	catch(er) {
		setTimeout(function() {
			_update_all_users_formkeys_testing (req, res);
		}, 1000);
	}

};

function testformkey(req, res){
	var formkey = crypto.formkey((Math.floor(new Date() / 1000)).toString());
	_update_all_users_formkeys_testing (req, res, formkey);
};

////////////////////////////////////////////////////////////////////////////////////////////////////////////

async function _get_formkey (req, res, username, password) {

	var qs = 'select tbl.form_key from admin tbl where tbl.username =\''+username+'\' and tbl.password =\''+crypt.encrypt(password)+'\'';
	var q = couchbase.N1qlQuery.fromString(qs);

	q.consistency(couchbase.N1qlQuery.Consistency.REQUEST_PLUS);
	var req = await bucket.query(q);

	await sbucket.query(q, function(err, rows) {	
	    if (!err) {
	    	if(crypt.is_allowed(rows[0].tbl.form_key)==true){
	    		res.writeHead(200, {"Content-Type": 'application/json'});
				res.end(JSON.stringify({ code: 200, result : {"Type":"Results","Output":"Authorized"}}));
	    	}else{
	    		res.writeHead(401, {"Content-Type": 'application/json'});
				res.end(JSON.stringify({ code: 401, result : {"Type":"Results","Output":"Rejected"}}));
	    	}
	    } else {
	        setTimeout(function() {
	        	_get_formkey(req, res, username, password);
	        }, 1000);
	    }
	});

};

////////////////////////////////////////////////////////////////////////////////////////////////////////////

async function _update_user (req, res, username='', formkey='', id='', acl_type='', name='', email='', user_name='', password='', re_password='') {

	var passwords = '';

	if(password != '' && re_password!='' && password == re_password){
		passwords = ' `password` = "' + crypto.password_encrypt(password) + '", ';
	}

	var qs  = 'UPDATE `admin` SET'
			+ ' `acl_type` = "' + acl_type + '", '
			+ ' `email` = "' + email + '", '
			+ ' `name` = "' + name + '", '
			+ passwords
			+ ' `username` = "' + user_name + '" '
			+ 'WHERE meta(`admin`).id = \'' + id + '\'';

	var q = couchbase.N1qlQuery.fromString(qs);

	q.consistency(couchbase.N1qlQuery.Consistency.REQUEST_PLUS);

	await bucket.query(q, function(err, rows) {	
	    if (!err) {
    		res.writeHead(200, {"Content-Type": 'application/json'});
			res.end(JSON.stringify({ code: 200, result : {"Type":"Results","Output":"User Updated."}}));
	    } else {
	        setTimeout(function() {
	        	_update_user (req, res);
	        }, 1000);
	    }
	});

};

async function _does_user_update_exist (req, res, username='', formkey='', id='', acl_type='', name='', email='', user_name='', password='', re_password='') {

	if(user_name==''){
		helper.user_blank(req, res);
	}else if(id==''){
		helper.id_blank(req, res);
	}else if(acl_type==''){
		helper.acl_blank(req, res);
	}else if(email==''){
		helper.email_blank(req, res);
	}else if(name==''){
		helper.name_blank(req, res);
	}else if(password != '' && re_password!='' && password != re_password){
		helper.user_pasword(req, res);
	// }else if(password=='' && ){
	// 	helper.user_pasword_blank(req, res);
	}else{
		var qs = 'SELECT meta(tbl).id FROM admin tbl WHERE meta(tbl).id =\''+id+'\'';
		var q = couchbase.N1qlQuery.fromString(qs);
		q.consistency(couchbase.N1qlQuery.Consistency.REQUEST_PLUS);

		await bucket.query(q, function(err, rows) {	
		    if (!err) {
		    	if(rows.length==1){
		    		_update_user (req, res, username, formkey, id, acl_type, name, email, user_name, password, re_password);
		    		//helper.place_holder(req, res);
				} else {
					helper.user_na_exist(req, res);
				}
		    } else {
		        setTimeout(function() {
		        	_does_user_update_exist (req, res, username, formkey, id, acl_type, name, email, user_name, password, re_password);
		        }, 1000);
		    }
		});
	}

};

async function _pre_update_user (req, res, username='', formkey='', id='', acl_type='', name='', email='', user_name='', password='', re_password='') {

	var qs = 'SELECT meta(tbl).id, tbl.acl_type FROM admin tbl WHERE tbl.username =\''+username+'\' AND tbl.form_key =\''+formkey+'\' LIMIT 1';
	var q = couchbase.N1qlQuery.fromString(qs);
	q.consistency(couchbase.N1qlQuery.Consistency.REQUEST_PLUS);

	await bucket.query(q, function(err, rows) {
		
	    if (!err) {
	    	if(rows.length==1){
		    	if(rows[0].id==null){
		    		helper.not_authorized(req, res);
		    	}else{
		    		if(rows[0].acl_type=='0' && id == rows[0].id){
		    			_does_user_update_exist (req, res, username, formkey, id, acl_type, name, email, user_name, password, re_password);
		    		}else if(rows[0].acl_type=='1'){
		    			_does_user_update_exist (req, res, username, formkey, id, acl_type, name, email, user_name, password, re_password);
		    		}else{
		    			helper.not_authorized(req, res);
		    		}
		    	}
			} else {
				helper.not_authorized(req, res);
			}
	    } else {
	        setTimeout(function() {
	        	_pre_update_user (req, res, username, formkey, acl_type, name, email, user_name, password, re_password);
	        }, 1000);
	    }
	});

};

function _pre_check_user_update(req, res){
	var parms = helper.get_parms(req);
	if(parms!=null){
		if(crypto.is_allowed(parms.formkey)==true){
			_pre_update_user (req, res, parms.user, parms.formkey, parms.id, parms.acl_type, parms.name, parms.email, parms.username, parms.password, parms.re_password);
		}else{
			helper.not_authorized(req, res);
		}
	}else{
		helper.not_authorized(req, res);
	}
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////

async function _create_user (req, res, username='', formkey='', acl_type='', name='', email='', user_name='', password='', re_password='') {

	var qs  = 'INSERT INTO `admin` ( KEY, VALUE ) VALUES ( UUID(), '
			+ '{ "acl_type": "' + acl_type + '", '
			+ '"email": "' + email + '", '
			+ '"form_key": "na", '
			+ '"name": "' + name + '", '
			+ '"password": "' + crypto.password_encrypt(password) + '", '
			+ '"username": "' + user_name + '" '
			+ '} );';
	var q = couchbase.N1qlQuery.fromString(qs);

	q.consistency(couchbase.N1qlQuery.Consistency.REQUEST_PLUS);

	await bucket.query(q, function(err, rows) {	
	    if (!err) {
    		res.writeHead(200, {"Content-Type": 'application/json'});
			res.end(JSON.stringify({ code: 200, result : {"Type":"Results","Output":"User Added."}}));
	    } else {
	        setTimeout(function() {
	        	_create_user (req, res, username, formkey, acl_type, name, email, user_name, password, re_password);
	        }, 1000);
	    }
	});
};


async function _does_user_exist (req, res, username='', formkey='', acl_type='', name='', email='', user_name='', password='', re_password='') {

	if(user_name==''){
		helper.user_blank(req, res);
	}else if(acl_type==''){
		helper.acl_blank(req, res);
	}else if(email==''){
		helper.email_blank(req, res);
	}else if(name==''){
		helper.name_blank(req, res);
	}else if(password != re_password){
		helper.user_pasword(req, res);
	}else if(password==''){
		helper.user_pasword_blank(req, res);
	}else{
		var qs = 'SELECT meta(tbl).id FROM admin tbl WHERE tbl.username =\''+user_name+'\'';
		var q = couchbase.N1qlQuery.fromString(qs);
		q.consistency(couchbase.N1qlQuery.Consistency.REQUEST_PLUS);

		await bucket.query(q, function(err, rows) {	
		    if (!err) {
		    	if(rows.length>=1){
		    		helper.user_exist(req, res);
				} else {
					_create_user(req, res, username, formkey, acl_type, name, email, user_name, password, re_password);
				}
		    } else {
		        setTimeout(function() {
		        	_does_user_exist (req, res, username, formkey, acl_type, name, email, user_name, password, re_password);
		        }, 1000);
		    }
		});
	}

};

async function _pre_create_user (req, res, username='', formkey='', acl_type='', name='', email='', user_name='', password='', re_password='') {

	var qs = 'SELECT meta(tbl).id, tbl.acl_type FROM admin tbl WHERE tbl.username =\''+username+'\' AND tbl.form_key =\''+formkey+'\' LIMIT 1';
	var q = couchbase.N1qlQuery.fromString(qs);
	q.consistency(couchbase.N1qlQuery.Consistency.REQUEST_PLUS);

	await bucket.query(q, function(err, rows) {	
	    if (!err) {
	    	if(rows.length==1){
		    	if(rows[0].id==null){
		    		helper.not_authorized(req, res);
		    	}else{
		    		if(rows[0].acl_type=='0'){
		    			_does_user_exist (req, res, username, formkey, acl_type, name, email, user_name, password, re_password);
		    		}else if(rows[0].acl_type=='1'){
		    			_does_user_exist (req, res, username, formkey, acl_type, name, email, user_name, password, re_password);
		    		}else{
		    			helper.not_authorized(req, res);
		    		}
		    	}
			} else {
				helper.not_authorized(req, res);
			}
	    } else {
	        setTimeout(function() {
	        	_pre_create_user (req, res, username, formkey, acl_type, name, email, user_name, password, re_password);
	        }, 1000);
	    }
	});

};

function _pre_check_user_create(req, res){
	var parms = helper.get_parms(req);
	if(parms!=null){
		if(crypto.is_allowed(parms.formkey)==true){
			_pre_create_user(req, res, parms.user, parms.formkey, parms.acl_type, parms.name, parms.email, parms.username, parms.password, parms.re_password);
		}else{
			helper.not_authorized(req, res);
		}
	}else{
		helper.not_authorized(req, res);
	}
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////

async function _delete_user (req, res, id='') {

	if(id==''){
		helper.id_blank(req, res);
	}else{

		var qs = 'DELETE FROM admin tbl WHERE meta(tbl).id =\''+id+'\'';
		var q = couchbase.N1qlQuery.fromString(qs);

		q.consistency(couchbase.N1qlQuery.Consistency.REQUEST_PLUS);
		var req = await bucket.query(q);

		await bucket.query(q, function(err, rows) {	
		    if (!err) {
	    		res.writeHead(200, {"Content-Type": 'application/json'});
				res.end(JSON.stringify({ code: 200, result : {"Type":"Results","Output":"User Deleted"}}));
		    } else {
		        setTimeout(function() {
		        	_delete_user (req, res, id);
		        }, 1000);
		    }
		});

	}

};

async function _does_delete_user_exist (req, res, id='') {

	if(id==''){
		helper.id_blank(req, res);
	}else{
		var qs = 'SELECT meta(tbl).id FROM admin tbl WHERE meta(tbl).id =\''+id+'\'';
		var q = couchbase.N1qlQuery.fromString(qs);
		q.consistency(couchbase.N1qlQuery.Consistency.REQUEST_PLUS);

		await bucket.query(q, function(err, rows) {	
		    if (!err) {
		    	if(rows.length>=1){
		    		_delete_user (req, res, id);
				} else {
					helper.user_na_exist(req, res);
				}
		    } else {
		        setTimeout(function() {
		        	_does_delete_user_exist (req, res, id);
		        }, 1000);
		    }
		});
	}

};

async function _pre_select_user_del (req, res, username, formkey, id='') {

	var qs = 'SELECT meta(tbl).id, tbl.acl_type FROM admin tbl WHERE tbl.username =\''+username+'\' AND tbl.form_key =\''+formkey+'\' LIMIT 1';
	var q = couchbase.N1qlQuery.fromString(qs);

	q.consistency(couchbase.N1qlQuery.Consistency.REQUEST_PLUS);
	var req = await bucket.query(q);

	await bucket.query(q, function(err, rows) {	
	    if (!err) {
	    	if(rows.length==1){
		    	if(rows[0].id==null){
		    		helper.not_authorized(req, res);
		    	}else{
		    		if(rows[0].acl_type=='0' && id == rows[0].id){
		    			_does_delete_user_exist(req, res, id);
		    		}else if(rows[0].acl_type=='1' && id != rows[0].id){
		    			_does_delete_user_exist(req, res, id);
		    		}else{
		    			helper.not_authorized(req, res);
		    		}
		    	}
			} else {
				helper.not_authorized(req, res);
			}
	    } else {
	        setTimeout(function() {
	        	_pre_select_user_del (req, res, username, formkey, id);
	        }, 1000);
	    }
	});

};

function _pre_check_user_del(req, res){
	var parms = helper.get_parms(req);
	if(parms!=null){
		if(crypto.is_allowed(parms.formkey)==true){
			_pre_select_user_del(req, res, parms.user, parms.formkey, parms.id);
		}else{
			helper.not_authorized(req, res);
		}
	}else{
		helper.not_authorized(req, res);
	}
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////

async function _select_user (req, res, id) {

	var qs = 'SELECT meta(tbl).id, tbl.acl_type, tbl.name, tbl.username, tbl.email FROM admin tbl WHERE meta(tbl).id =\''+id+'\'';
	var q = couchbase.N1qlQuery.fromString(qs);

	q.consistency(couchbase.N1qlQuery.Consistency.REQUEST_PLUS);
	var req = await bucket.query(q);

	await bucket.query(q, function(err, rows) {	
	    if (!err) {
    		res.writeHead(200, {"Content-Type": 'application/json'});
			res.end(JSON.stringify({ code: 200, result : {"Type":"Results","Output":rows}}));
	    } else {
	        setTimeout(function() {
	        	_select_user (req, res, id);
	        }, 1000);
	    }
	});

};

async function _pre_select_user (req, res, username, formkey, id) {

	var qs = 'SELECT meta(tbl).id, tbl.acl_type FROM admin tbl WHERE tbl.username =\''+username+'\' AND tbl.form_key =\''+formkey+'\' LIMIT 1';
	var q = couchbase.N1qlQuery.fromString(qs);

	q.consistency(couchbase.N1qlQuery.Consistency.REQUEST_PLUS);
	var req = await bucket.query(q);

	await bucket.query(q, function(err, rows) {	
	    if (!err) {
	    	if(rows.length==1){
		    	if(rows[0].id==null){
		    		helper.not_authorized(req, res);
		    	}else{
		    		if(rows[0].acl_type=='0' && id == rows[0].id){
		    			_select_user(req, res, id);
		    		}else if(rows[0].acl_type=='1'){
		    			_select_user(req, res, id);
		    		}else{
		    			helper.not_authorized(req, res);
		    		}
		    	}
			} else {
				helper.not_authorized(req, res);
			}
	    } else {
	        setTimeout(function() {
	        	_pre_select_user (req, res,  username, formkey, id);
	        }, 1000);
	    }
	});

};

function _pre_check_user(req, res){
	var parms = helper.get_parms(req);
	if(parms!=null){
		if(crypto.is_allowed(parms.formkey)==true){
			_pre_select_user(req, res, parms.user, parms.formkey, parms.id);
		}else{
			helper.not_authorized(req, res);
		}
	}else{
		helper.not_authorized(req, res);
	}
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////

async function _select_all_users_acl_na (req, res, username) {

	var qs = 'select meta(tbl).id, tbl.acl_type, tbl.name, tbl.username, tbl.email from '+bucket_name+' tbl where tbl.username = \''+username+'\'';
	var q = couchbase.N1qlQuery.fromString(qs);

	q.consistency(couchbase.N1qlQuery.Consistency.REQUEST_PLUS);
	
	await bucket.query(q, function(err, rows) {	
	    if (!err) {
    		res.writeHead(200, {"Content-Type": 'application/json'});
			res.end(JSON.stringify({ code: 200, result : {"Type":"Results","Output":rows}}));
	    } else {
	        setTimeout(function() {
	        	_select_all_users_acl_na (req, res, username);
	        }, 1000);
	    }
	});

};

async function _select_all_users (req, res) {

	var qs = 'select meta(tbl).id, tbl.acl_type, tbl.name, tbl.username, tbl.email from '+bucket_name+' tbl';
	var q = couchbase.N1qlQuery.fromString(qs);

	q.consistency(couchbase.N1qlQuery.Consistency.REQUEST_PLUS);
	
	await bucket.query(q, function(err, rows) {	
	    if (!err) {
    		res.writeHead(200, {"Content-Type": 'application/json'});
			res.end(JSON.stringify({ code: 200, result : {"Type":"Results","Output":rows}}));
	    } else {
	        setTimeout(function() {
	        	_select_all_users (req, res);
	        }, 1000);
	    }
	});

};

async function _pre_select_allusers (req, res, username, formkey) {

	var qs = 'select meta(tbl).id, tbl.acl_type from admin tbl where tbl.username =\''+username+'\' and tbl.form_key =\''+formkey+'\' limit 1';
	var q = couchbase.N1qlQuery.fromString(qs);

	q.consistency(couchbase.N1qlQuery.Consistency.REQUEST_PLUS);

	await bucket.query(q, function(err, rows) {	
	    if (!err) {
	    	if(rows.length==1){
		    	if(rows[0].id==null){
		    		helper.not_authorized(req, res);
		    	}else{
		    		if(rows[0].acl_type=='1'){
		    			_select_all_users(req, res);
		    		}else{
		    			_select_all_users_acl_na(req, res, username);
		    		}
		    	}
		    }else{
		    	helper.not_authorized(req, res);
		    }
	    } else {
	        setTimeout(function() {
	        	_pre_select_allusers (req, res, username, formkey);
	        }, 1000);
	    }
	});

};

function _pre_check_allusers(req, res){
	var parms = helper.get_parms(req);
	if(parms!=null && parms.formkey != null && parms.user != null){
		if(crypto.is_allowed(parms.formkey.toString())==true){
			_pre_select_allusers(req, res, parms.user, parms.formkey);
		}else{
			helper.not_authorized(req, res);
		}
	}else{
		helper.not_authorized(req, res);
	}
};

////////////////////////////////////////////////////////////////////////////////////////////////////////////

async function _update_user_formkey (req, res, id) {

	var formkey = crypto.formkey((Math.floor(new Date() / 1000)).toString());
	var qs = 'UPDATE `admin` set `form_key` = \'' + formkey + '\' WHERE meta(`admin`).id = \'' + id + '\';';
	var q = couchbase.N1qlQuery.fromString(qs);

	q.consistency(couchbase.N1qlQuery.Consistency.REQUEST_PLUS);
	
	await bucket.query(q, function(err, rows) {	
	    if (!err) {
    		res.writeHead(200, {"Content-Type": 'application/json'});
			res.end(JSON.stringify({ code: 200, result : {"Type":"Results","Output":formkey}}));
	    } else {
	        setTimeout(function() {
	        	_update_user_formkey (req, res, id);
	        }, 1000);
	    }
	});

};

async function _pre_select_login (req, res, username='', password='', acl=0) {

	var qs = 'SELECT meta(tbl).id, tbl.* FROM `admin` tbl '
		   + 'WHERE tbl.username =\'' + username + '\' and tbl.acl_type = \''+acl+'\' '
		   + 'limit 1';

	var q = couchbase.N1qlQuery.fromString(qs);

	q.consistency(couchbase.N1qlQuery.Consistency.REQUEST_PLUS);

	await bucket.query(q, function(err, rows) {	
	    if (!err) {
	    	if(rows.length==1){
				if(crypto.password_check(password,rows[0].password)){
					_update_user_formkey (req, res, rows[0].id);
					//helper.place_holder(req, res);
				}else{
					helper.invaild_login(req, res);
				}
		    }else{
				helper.invaild_login(req, res);
		    }
	    } else {
	        setTimeout(function() {
	        	_pre_select_login (req, res, username, password);
	        }, 1000);
	    }
	});

};

function _pre_check_login(req, res){
	var parms = helper.get_parms(req);
	if(parms!=null && parms.password != null && parms.username != null){
		_pre_select_login(req, res, parms.username, parms.password, 1);
	}else{
		helper.not_authorized(req, res);
	}
};

function _pre_check_login_local(req, res){
	var parms = helper.get_parms(req);
	if(parms!=null && parms.password != null && parms.username != null){
		_pre_select_login(req, res, parms.username, parms.password ,0);
	}else{
		helper.not_authorized(req, res);
	}
};

////////////////////////////////////////////////////////////////////////////////////////////////////////////

async function _update_user_email_link (req, res, id, email) {

	var resetlink = crypto.encrypt((Math.floor(new Date() / 1000)).toString());
	var qs = 'UPDATE `admin` set `reset_link` = \'' + resetlink + '\' WHERE meta(`admin`).id = \'' + id + '\';';
	var q = couchbase.N1qlQuery.fromString(qs);

	q.consistency(couchbase.N1qlQuery.Consistency.REQUEST_PLUS);
	
	await bucket.query(q, function(err, rows) {	
	    if (!err) {
	    	emailer.send_email(email, 'Reset password for Node App', '<a href="http://circascreens.com/reset/email/' + resetlink + '" >Click here to reset password!</a>');
    		res.writeHead(200, {"Content-Type": 'application/json'});
			res.end(JSON.stringify({ code: 200, result : {"Type":"Results","Output":'email has been sent'}}));
	    } else {
	        setTimeout(function() {
	        	_update_user_email_link (req, res, id, email);
	        }, 1000);
	    }
	});

};

async function _pre_select_email (req, res, email='') {

	var qs = 'SELECT meta(tbl).id, tbl.* FROM `admin` tbl '
		   + 'WHERE tbl.email =\'' + email + '\' '
		   + 'limit 1';

	var q = couchbase.N1qlQuery.fromString(qs);

	q.consistency(couchbase.N1qlQuery.Consistency.REQUEST_PLUS);

	await bucket.query(q, function(err, rows) {	
	    if (!err) {
	    	if(rows.length==1){
	    		_update_user_email_link (req, res, rows[0].id, email);
		    }else{
		    	helper.not_authorized(req, res);
		    }
	    } else {
	        setTimeout(function() {
	        	_pre_select_allusers(req, res);
	        }, 1000);
	    }
	});

};

////////////////////////////////////////////////////////////////////////////////////////////////////////////

async function _update_user_email_reset (req, res, id) {

	var randomstring = require("randomstring");

	const new_password = randomstring.generate({
		length: 35,
		charset: 'alphabetic'
	});

	var qs = 'UPDATE `admin` set `reset_link` = null, `password` = \'' + crypto.password_encrypt(new_password) + '\' WHERE meta(`admin`).id = \'' + id + '\';';
	var q = couchbase.N1qlQuery.fromString(qs);

	q.consistency(couchbase.N1qlQuery.Consistency.REQUEST_PLUS);
	
	await bucket.query(q, function(err, rows) {	
	    if (!err) {
    		res.writeHead(200, {"Content-Type": 'text/html'});
			res.end('Your new password is : '+new_password);
	    } else {
	        setTimeout(function() {
	        	_update_user_email_reset (req, res, id)
	        }, 1000);
	    }
	});

};

async function _pre_select_email_reset (req, res, resetlink='') {

	var qs = 'SELECT meta(tbl).id FROM `admin` tbl '
		   + 'WHERE tbl.`reset_link` =\'' + resetlink + '\' AND not `reset_link` is null '
		   + 'limit 1';

	var q = couchbase.N1qlQuery.fromString(qs);

	q.consistency(couchbase.N1qlQuery.Consistency.REQUEST_PLUS);

	await bucket.query(q, function(err, rows) {	
	    if (!err) {
	    	if(rows.length==1){
	    		_update_user_email_reset (req, res, rows[0].id);
		    }else{
		    	helper.not_authorized(req, res);
		    }
	    } else {
	        setTimeout(function() {
	        	_pre_select_email_reset (req, res, resetlink);
	        }, 1000);
	    }
	});

};

function _pre_check_email(req, res){
	var parms = helper.get_parms(req);
	if(parms!=null && parms.email != null){
		_pre_select_email(req, res, parms.email);
	}else if(parms!=null && req.params.resetlink != null){
		_pre_select_email_reset(req, res, req.params.resetlink);
	}else{
		helper.not_authorized(req, res);
	}
};

////////////////////////////////////////////////////////////////////////////////////////////////////////////

module.exports = {
	formkey_testing : (req, res) => {
		testformkey(req,res);
	},
	all_users : (req, res) => {
		_pre_check_allusers(req, res);
	},
	get_user : (req, res) => {
		_pre_check_user(req, res);
	},
	del_user : (req, res) => {
		_pre_check_user_del(req, res);
	},
	create_user : (req, res) => {
		_pre_check_user_create(req, res);
	},
	update_user : (req, res) => {
		_pre_check_user_update(req, res);
	},
	user_login : (req, res) => {
		_pre_check_login(req, res);
	},
	user_login_local : (req, res) => {
		_pre_check_login_local(req, res);
	},
	user_email : (req, res) => {
		_pre_check_email(req, res);
	},

}