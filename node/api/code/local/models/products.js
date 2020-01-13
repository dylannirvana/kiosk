'use strict';

let   helper      = require('../helper/response');
const bucket_name = 'products';
var   couchbase   = require('couchbase');
let   config      = require('../etc/config');
var   cluster     = new couchbase.Cluster(config.get_cb_server());
cluster.authenticate(config.get_cb_username(), config.get_cb_password());
var   bucket      = cluster.openBucket(bucket_name);

function _create_filter (category, height, width, designer, finish, price_from, price_to) {

	var query_filter = 'where not base_code = \'\' ';

	if(category!=null && category!=''){
		console.log(category.split('/').length);
		if(category.split('/').length=='2'){
			query_filter = query_filter + 'and category_main = \''+category.split('/')[0]+'\' and category_sub = \''+category.split('/')[1]+'\' ';
		}else if(category.split('/').length=='1'){
			query_filter = query_filter + 'and category_main = \''+category+'\' ';
		}
	}

	/*if(query_filter==''){
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
	}*/

	return query_filter;

};

function _select_products (req, res, category, height, width, designer, finish, price_from, price_to) {
	var filter = _create_filter(category, height, width, designer, finish, price_from, price_to);
	var qs = 'SELECT tbl.* FROM `'+bucket_name+'` tbl '+filter+'order by sort_order ASC, name ASC';
	var q = couchbase.N1qlQuery.fromString(qs);

	q.consistency(couchbase.N1qlQuery.Consistency.REQUEST_PLUS);

	//console.log(qs);

	bucket.query(q, function(err, rows) {
	    if (!err) {
       		res.writeHead(200, {"Content-Type": 'application/json'});
	        res.end(JSON.stringify({ code: 200, result : {"Type":"Results","Output":rows}}));
	    } else {
	        setTimeout(function() {
	        	_select_products(req, res);
	        }, 1000);
	    }

	});

};

function _filter_products (req, res){
	var parms = helper.get_parms(req);
	if(parms!=null){
		_select_products (
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
		_select_products (
			req, 
			res,
		);
	}
};

module.exports = {
	get : (req, res) => {
		_filter_products (req, res);
	}
}