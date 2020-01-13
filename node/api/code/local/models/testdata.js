'use strict';

var couchbase = require('couchbase');
let   config      = require('../etc/config');
var   cluster     = new couchbase.Cluster(config.get_cb_server());
cluster.authenticate(config.get_cb_username(), config.get_cb_password());

function testdata (req, res) {

	var bucket = cluster.openBucket('data-feed');	
	var qs = 'SELECT * FROM `data-feed` order by base_code, sort_order, name desc;';
	var q = couchbase.N1qlQuery.fromString(qs);

	q.consistency(couchbase.N1qlQuery.Consistency.REQUEST_PLUS);

	bucket.query(q, function(err, rows) {
		/*if (err) {
		  throw err;
		}*/

		/*if (rows.length !== 1) {
		  throw new Error('unexpected number of rows');
		}*/
		res.writeHead(200, {"Content-Type": 'application/json'});
        res.end(JSON.stringify({ code: 200, result : {"Type":"Results","Output":rows}}));
		//console.log(rows);	
	});

};

module.exports = {
	get : (req, res) => {
		testdata(req,res);
	}
	// insert : (req, res) => {
	// 	testdata(req,res);
	// },
	// update : (req, res) => {
	// 	testdata(req,res);
	// },
	// delete : (req, res) => {
	// 	testdata(req,res);
	// },
}