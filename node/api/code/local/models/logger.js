'use strict';

let   crypto      = require('./crypto');
let   helper      = require('../helper/response');
const bucket_name = 'logger';
var   couchbase   = require('couchbase');
let   config      = require('../etc/config');
var   cluster     = new couchbase.Cluster(config.get_cb_server());
cluster.authenticate(config.get_cb_username(), config.get_cb_password());
var   bucket      = cluster.openBucket(bucket_name);

////////////////////////////////////////////////////////////////////////////////////////////////////////////

async function _insert_logger (seconds, payload, type, from, error='', date) {

	let data = {
		'status'  : type,
		'from'    : from,
		'payload' : payload,
		'error'   : error,
		'date'    : date
	}

	var qs = 'INSERT INTO `logger` ( KEY, VALUE ) VALUES (UUID(),'+JSON.stringify(data)+');';
	var q = couchbase.N1qlQuery.fromString(qs);

	q.consistency(couchbase.N1qlQuery.Consistency.REQUEST_PLUS);
	var req = bucket.query(q);

	req.on('error', function(err) {
		setTimeout(function() {
			_insert_logger (data, type, from, error='', date)
		}, seconds);
	});

	/*req.on('end', function(meta) {
		console.log('Status : %j %j', meta.status, meta.metrics.executionTime);
	});*/

};

function log_this (seconds, payload, type, from, error='', date) {

	if(date==null)
		date = new Date();
	//console.log(payload);
	//_insert_logger(seconds, payload, type, from, error='', date);

};

////////////////////////////////////////////////////////////////////////////////////////////////////////////

async function _delete_flush_logs (req, res) {

	var qs = 'delete from `'+bucket_name+'` tbl;';
	var q = couchbase.N1qlQuery.fromString(qs);

	q.consistency(couchbase.N1qlQuery.Consistency.REQUEST_PLUS);
	var req = await bucket.query(q);

	req.on('error', function(err) {
		setTimeout(function() {
			_delete_flush_logs (req, res);
		}, 1000);
	});

	req.on('end', function(meta) {
		res.writeHead(200, {"Content-Type": 'application/json'});
        res.end(JSON.stringify({ code: 200, result : {"Type":"Results","Output":"Logs have been purged"}}));
	});

};

async function _pre_delete_flush_logs (req, res, username, formkey) {

	var qs = 'select meta(tbl).id, tbl.acl_type from admin tbl where tbl.username =\''+username+'\' and tbl.form_key =\''+formkey+'\' limit 1';
	var q = couchbase.N1qlQuery.fromString(qs);

	q.consistency(couchbase.N1qlQuery.Consistency.REQUEST_PLUS);
	var req = await bucket.query(q);

	await bucket.query(q, function(err, rows) {
	    if (!err) {
	    	if(rows.length==1){
		    	if(rows[0].id==null){
		    		helper.not_authorized(req, res);
		    	}else{
		    		if(rows[0].acl_type=='1'){
		    			_delete_flush_logs(req, res);
		    		}else{
		    			helper.not_authorized(req, res);
		    		}
		    	}
			} else {
				helper.not_authorized(req, res);
			}
	    } else {
	        setTimeout(function() {
	        	_pre_delete_flush_logs(req, res);
	        }, 1000);
	    }
	});

};

function _pre_check_flush_logs(req, res){
	var parms = helper.get_parms(req);
	console.log(parms);
	if(parms!=null){
		if(crypto.is_allowed(parms.formkey)==true){
			_pre_delete_flush_logs(req, res, parms.user, parms.formkey);
		}else{
			helper.not_authorized(req, res);
		}
	}else{
		helper.not_authorized(req, res);
	}
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////

async function _select_view_logs (req, res) {

	var qs = 'select * from `'+bucket_name+'` tbl order by date desc;';
	var q = couchbase.N1qlQuery.fromString(qs);

	q.consistency(couchbase.N1qlQuery.Consistency.REQUEST_PLUS);
	var req = await bucket.query(q);

	await bucket.query(q, function(err, rows) {
	    if (!err) {
    		res.writeHead(200, {"Content-Type": 'application/json'});
			res.end(JSON.stringify({ code: 200, result : {"Type":"Results","Output":rows}}));
	    } else {
	        setTimeout(function() {
	        	_select_view_logs (req, res);
	        }, 1000);
	    }
	});

};

async function _pre_select_view_logs (req, res, username, formkey) {

	var qs = 'select meta(tbl).id, tbl.acl_type from admin tbl where tbl.username =\''+username+'\' and tbl.form_key =\''+formkey+'\' limit 1';
	var q = couchbase.N1qlQuery.fromString(qs);

	q.consistency(couchbase.N1qlQuery.Consistency.REQUEST_PLUS);
	var req = await bucket.query(q);

	await bucket.query(q, function(err, rows) {
	    if (!err) {
	    	if(rows.length==1){
		    	if(rows[0].id==null){
		    		helper.not_authorized(req, res);
		    	}else{
					// disabling acl for viewing log
		    		//if(rows[0].acl_type=='1'){
		    			_select_view_logs(req, res);
		    		//}else{
		    		//	helper.not_authorized(req, res);
		    		//}
		    	}
			} else {
				helper.not_authorized(req, res);
			}
	    } else {
	        setTimeout(function() {
	        	_pre_select_view_logs(req, res);
	        }, 1000);
	    }
	});

};

function _pre_check_view_logs(req, res){
	var parms = helper.get_parms(req);
	if(parms!=null && parms.formkey!=null){
		if(crypto.is_allowed(parms.formkey)==true){
			_pre_select_view_logs(req, res, parms.user, parms.formkey);
		}else{
			helper.not_authorized(req, res);
		}
	}else{
		helper.not_authorized(req, res);
	}
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////

module.exports = {
	log : (seconds, payload, type, from, date) => {
		log_this(seconds, payload, type, from, date);
	},

	flush : (req, res) => {
		_pre_check_flush_logs (req, res);
	},

	get : (req, res) => {
		_pre_check_view_logs (req, res);
	},
}