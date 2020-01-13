'use strict';

let   helper      = require('../helper/response');
const bucket_name = 'products';
var   couchbase   = require('couchbase');
let   config      = require('../etc/config');
var   cluster     = new couchbase.Cluster(config.get_cb_server());
cluster.authenticate(config.get_cb_username(), config.get_cb_password());
var   bucket      = cluster.openBucket(bucket_name);

function _select_search (req, res, search) {
	var search_string = 'where LOWER(sku) like LOWER(\'%'+search+'%\') or LOWER(name) like LOWER(\'%'+search+'%\') ';
	var qs = 'SELECT tbl.* FROM `'+bucket_name+'` tbl '+search_string+'order by base_code ASC, sort_order ASC, name ASC;';
	var q = couchbase.N1qlQuery.fromString(qs);

	q.consistency(couchbase.N1qlQuery.Consistency.REQUEST_PLUS);

	bucket.query(q, function(err, rows) {
	    if (!err) {
       		res.writeHead(200, {"Content-Type": 'application/json'});
	        res.end(JSON.stringify({ code: 200, result : {"Type":"Results","Output":rows}}));
	    } else {
	        setTimeout(function() {
	        	_select_search(req, res);
	        }, 1000);
	    }
	});

};

function _pre_select_search (req, res){
	var parms = helper.get_parms(req);
	if(parms!=null){
		_select_search (
			req, 
			res, 
			parms.s
		);
	}else{
   		res.writeHead(500, {"Content-Type": 'application/json'});
        res.end(JSON.stringify({ code: 500, result : {"Type":"Error","Output":"Missing search paramter in query string or post"}}));
	}
};

module.exports = {
	get : (req, res) => {
		_pre_select_search(req,res);
	}
}