'use strict';

let   helper      = require('../helper/response');
const bucket_name = 'data-feed';
var   couchbase   = require('couchbase');
let   config      = require('../etc/config');
var   cluster     = new couchbase.Cluster(config.get_cb_server());
cluster.authenticate(config.get_cb_username(), config.get_cb_password());
var   bucket      = cluster.openBucket(bucket_name);

////////////////////////////////////////////////////////////////////////////////////////////////////////////

function _create_filter (category, height, width, designer, finish, price_from, price_to) {

	var query_filter = '';

	if(category!=null && category!=''){
		query_filter = 'where category = \''+category+'\' ';
	}

	if(query_filter==''){
		if(height!=null && height!=''){
			query_filter = 'where detail.criteria.height = \''+height+'\' ';
		}
	}else{
		if(height!=null && height!=''){
			query_filter = query_filter + 'and detail.criteria.height = \''+height+'\' ';
		}
	}

	if(query_filter==''){
		if(width!=null && width!=''){
			query_filter = 'where detail.criteria.width = \''+width+'\' ';
		}
	}else{
		if(width!=null && width!=''){
			query_filter = query_filter + 'and detail.criteria.width = \''+width+'\' ';
		}
	}

	if(query_filter==''){
		if(designer!=null && designer!=''){
			query_filter = 'where detail.designer = \''+designer+'\' ';
		}
	}else{
		if(designer!=null && designer!=''){
			query_filter = query_filter + 'and detail.designer = \''+designer+'\' ';
		}
	}

	if(query_filter==''){
		if(finish!=null && finish!=''){
			query_filter = 'where detail.finish = \''+finish+'\' ';
		}
	}else{
		if(finish!=null && finish!=''){
			query_filter = query_filter + 'and detail.finish = \''+finish+'\' ';
		}
	}

	if(query_filter==''){
		if(price_from!=null && price_from!='' && price_to!=null && price_to!=''){
			query_filter = 'where detail.price between \''+price_from+'\' and \''+price_to+'\' ';
		}
	}else{
		if(price_from!=null && price_from!='' && price_to!=null && price_to!=''){
			query_filter = query_filter + 'and detail.price between \''+price_from+'\' and \''+price_to+'\' ';
		}
	}

	return query_filter;

};

////////////////////////////////////////////////////////////////////////////////////////////////////////////

function _select_filters (req, res, category, height, width, designer, finish, price_from, price_to) {
	var filter = _create_filter(category, height, width, designer, finish, price_from, price_to);
	var qs = 'SELECT tbl.* from ('
			+ 'SELECT distinct \'width\' `name`, detail.criteria.width `value` FROM `data-feed` tbl ' + filter
			+ 'union '
			+ 'SELECT distinct \'height\' `name`, detail.criteria.height `value` FROM `data-feed` tbl ' + filter
			+ 'union '
			+ 'SELECT distinct \'designer\' `name`, detail.designer `value` FROM `data-feed` tbl ' + filter
			+ 'union '
			+ 'SELECT distinct \'finish\' `name`, detail.finish `value` FROM `data-feed` tbl ' + filter
			+ 'union '
			+ 'SELECT distinct \'price\' `name`, detail.price `value` FROM `data-feed` tbl ' + filter
			+ ') tbl order by `name`, `value`';
	var q = couchbase.N1qlQuery.fromString(qs);

	q.consistency(couchbase.N1qlQuery.Consistency.REQUEST_PLUS);

	bucket.query(q, function(err, rows) {
	    if (!err) {
       		res.writeHead(200, {"Content-Type": 'application/json'});
	        res.end(JSON.stringify({ code: 200, result : {"Type":"Results","Output":rows}}));
	    } else {
	        setTimeout(function() {
	        	_select_filters(req, res);
	        }, 1000);
	    }

	});

};

function _get_filters (req, res){
	var parms = helper.get_parms(req);
	if(parms!=null){
		_select_filters (
			req, 
			res, 
			parms.category, 
			parms.height, 
			parms.width, 
			parms.designer, 
			parms.finish, 
			parms.price_from, 
			parms.price_to
		);
	}else{
   		res.writeHead(500, {"Content-Type": 'application/json'});
        res.end(JSON.stringify({ code: 500, result : {"Type":"Error","Output":"Missing category paramter in query string or post"}}));
	}
};

module.exports = {
	get : (req, res) => {
		_get_filters (req, res);
	}
}