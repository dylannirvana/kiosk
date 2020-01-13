'use strict';

let          helper = require('../helper/response');
const  pbucket_name = 'products';
const ssbucket_name = 'slideshows';
const  abucket_name = 'admin';
var       couchbase = require('couchbase');
let          config = require('../etc/config');
var         cluster = new couchbase.Cluster(config.get_cb_server());
cluster.authenticate(config.get_cb_username(), config.get_cb_password());

var           shell = require('shelljs');
var              fs = require('fs');
var          logger = require('./logger');

const master_server = 'http://circascreens.com/';
const master_key = 'bpRM49Nqk54rqD3936j5856ad357X';
////////////////////////////////////////////////////////////////////////////////////////////////////////////

function _doesitpass(filename, limit=3600){
	let file_time = shell.exec('date -r '+filename+' +%s',{silent:true}).stdout;
	let current_time = shell.exec('date +%s',{silent:true}).stdout;
	// console.log('file_name: '+file_time.trim());
	// console.log('current_time: '+current_time.trim());
	if ((Number(file_time.trim()) + limit) >= Number(current_time.trim())) {
		return false;
	}else{
		return true;
	}
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////

async function _everything_butimages (req, res) {
	await _admin(req, res, false);
	await _products(req, res, false);
	await _slideshows(req, res, false);
	res.writeHead(200, {"Content-Type": 'application/json'});
	res.end(JSON.stringify({ code: 200, result : {"Type":"Results","Output": "Syncing data!"}}));
};

////////////////////////////////////////////////////////////////////////////////////////////////////////////

async function _everything (req, res) {
	res.writeHead(200, {"Content-Type": 'application/json'});
	res.end(JSON.stringify({ code: 200, result : {"Type":"Results","Output": "Syncing everything"}}));
	//let stdout = await shell.exec('curl '+master_server+'api/sync/push/images -o /dev/null',{silent:true}).stdout;
	await _admin(req, res, false);
	await _products(req, res, false);
	await _slideshows(req, res, false);
	await _process_images(req, res, false);
};

////////////////////////////////////////////////////////////////////////////////////////////////////////////

function _products (req, res, response_type=true) {
	if(_doesitpass('./var/tmp/product.json')){
		let stdout = shell.exec('rm -rf ./var/tmp/product.json',{silent:true}).stdout;
		stdout = shell.exec('rm -rf ./var/tmp/categories.json',{silent:true}).stdout;
		logger.log(0, 'Downloading Products to Sync', 'success', '/api/sync/products', "");
		stdout = shell.exec('curl '+master_server+'api/sync/push/products --data-urlencode "authkey='+master_key+'"  -o ./var/tmp/product.json',{silent:true}).stdout;
		var content = fs.readFileSync("./var/tmp/product.json");
		var json_output = JSON.parse(content);
		const output = json_output.result.Output;
	
		if(output.length >= 1 && output != 'Not Authorized' && output != 'Invaild Method' && output != '[]'){
			
			if(response_type==true){
				res.writeHead(200, {"Content-Type": 'application/json'});
				res.end(JSON.stringify({ code: 200, result : {"Type":"Results","Output": "Syncing products"}}));
			}
			logger.log(0, 'Starting Products to Sync to Database', 'success', '/api/sync/products', '');
			_delete_products (req, res, output);
		}else{
			if(response_type==true){
				helper.not_authorized(req, res);
			}
		}		
	}else{
		res.writeHead(200, {"Content-Type": 'application/json'});
		res.end(JSON.stringify({ code: 500, result : {"Type":"Error","Output": "Can not sync at this time. Please wait an hour before trying again."}}));
		logger.log(0, 'Product sync can not process due to 1 hour limit has not been met', 'error', '/api/sync/products', '');
	}
	
};

async function  _delete_products (req, res, output){
	var       bucket = cluster.openBucket(pbucket_name);
	var           qs = 'DELETE FROM `products`;';
	var            q = couchbase.N1qlQuery.fromString(qs);
	q.consistency(couchbase.N1qlQuery.Consistency.REQUEST_PLUS);
	logger.log(0, 'Deleting old products from database', 'success', '/api/sync/products', '');
	await bucket.query(q, function(err, rows) {
		if (!err) {
			_products_parse (req, res, output);
		} else {
			logger.log(0, 'Error when deleting products', 'error', '/api/sync/products', err);
			setTimeout(function() {
				_delete_products (req, res, output);
			}, 1000);
		}
	});
};

async function  _products_parse (req, res, output, i=0){
	if(i <= (output.length-1)){
		if(i==0){
			logger.log(0, 'Starting to insert Products from Sync', 'success', '/api/sync/products', '');
		}
		var       bucket = cluster.openBucket(pbucket_name);
		var           qs = 'INSERT INTO `products` ( KEY, VALUE ) VALUES ( UUID(), ' + JSON.stringify(output[i].products) + ');';
		var            q = couchbase.N1qlQuery.fromString(qs);
		q.consistency(couchbase.N1qlQuery.Consistency.REQUEST_PLUS);
		await bucket.query(q, function(err, rows) {
			if (!err) {
				i++;
				// setTimeout(function() {
					_products_parse (req, res, output, i);
				// }, 1000);	
			} else {
				logger.log(0, 'Error when adding products', 'error', '/api/sync/products', err);
				setTimeout(function() {
					_products_parse (req, res, output, i);
				}, 10000);
			}
		});
	}else{
		logger.log(0, 'Syncing of Products has finished', 'success', '/api/sync/products', '');
	}
};

////////////////////////////////////////////////////////////////////////////////////////////////////////////

function _slideshows (req, res, response_type=true) {
	if(_doesitpass('./var/tmp/slideshows.json',60)){
		let stdout = shell.exec('rm -rf ./var/tmp/slideshows.json',{silent:true}).stdout;
		logger.log(0, 'Downloading Slideshows to Sync', 'success', '/api/sync/slideshows', "");
		stdout = shell.exec('curl '+master_server+'api/sync/push/slideshows --data-urlencode "authkey='+master_key+'"  -o ./var/tmp/slideshows.json',{silent:true}).stdout;
		var content = fs.readFileSync("./var/tmp/slideshows.json");
		var json_output = JSON.parse(content);
		const output = json_output.result.Output;

		if(output.length >= 1 && output != 'Not Authorized' && output != 'Invaild Method' && output != '[]'){
			if(response_type==true){
				res.writeHead(200, {"Content-Type": 'application/json'});
				res.end(JSON.stringify({ code: 200, result : {"Type":"Results","Output": "Syncing slideshows"}}));
			}
			logger.log(0, 'Starting Slideshows to Sync to Database', 'success', '/api/sync/slideshows', '');
			_delete_slideshows (req, res, output);
		}else{
			if(response_type==true){
				helper.not_authorized(req, res);
			}
		}	
	}else{
		res.writeHead(200, {"Content-Type": 'application/json'});
		res.end(JSON.stringify({ code: 500, result : {"Type":"Error","Output": "Can not sync at this time. Please wait an hour before trying again."}}));
		logger.log(0, 'Product sync can not process due to 1 hour limit has not been met', 'error', '/api/sync/slideshows', '');
	}
	
};

async function  _delete_slideshows (req, res, output){
	var       bucket = cluster.openBucket(ssbucket_name);
	var           qs = 'DELETE FROM `'+ssbucket_name+'`;';
	var            q = couchbase.N1qlQuery.fromString(qs);
	q.consistency(couchbase.N1qlQuery.Consistency.REQUEST_PLUS);
	logger.log(0, 'Deleting old Slideshows from database', 'success', '/api/sync/slideshows', '');
	await bucket.query(q, function(err, rows) {
		if (!err) {
			_slideshows_parse (req, res, output);
		} else {
			logger.log(0, 'Error when deleting Slideshows', 'error', '/api/sync/slideshows', err);
			setTimeout(function() {
				_delete_slideshows (req, res, output);
			}, 1000);
		}
	});
};

async function  _slideshows_parse (req, res, output, i=0){
	if(i <= (output.length-1)){
		if(i==0){
			logger.log(0, 'Starting to insert Slideshows from Sync', 'success', '/api/sync/slideshows', '');
		}
		var       bucket = cluster.openBucket(ssbucket_name);
		var           qs = 'INSERT INTO `'+ssbucket_name+'` ( KEY, VALUE ) VALUES ( UUID(), ' + JSON.stringify(output[i].slideshows) + ');';
		var            q = couchbase.N1qlQuery.fromString(qs);
		q.consistency(couchbase.N1qlQuery.Consistency.REQUEST_PLUS);
		await bucket.query(q, function(err, rows) {
			if (!err) {
				i++;
				_slideshows_parse (req, res, output, i);
			} else {
				logger.log(0, 'Error when adding Slideshows', 'error', '/api/sync/slideshows', err);
				setTimeout(function() {
					_slideshows_parse (req, res, output, i);
				}, 1000);
			}
		});
	}else{
		logger.log(0, 'Syncing of Slideshows has finished', 'success', '/api/sync/slideshows', '');
		await _process_images(req, res, false);
	}
};

////////////////////////////////////////////////////////////////////////////////////////////////////////////

function _admin (req, res, response_type=true) {
	if(_doesitpass('./var/tmp/admin.json',300)){
		let stdout = shell.exec('rm -rf ./var/tmp/admin.json',{silent:true}).stdout;
		logger.log(0, 'Downloading Admin users to Sync', 'success', '/api/sync/admin', "");
		stdout = shell.exec('curl '+master_server+'api/sync/push/admin --data-urlencode "authkey='+master_key+'"  -o ./var/tmp/admin.json',{silent:true}).stdout;
		var content = fs.readFileSync("./var/tmp/admin.json");
		var json_output = JSON.parse(content);
		const output = json_output.result.Output;

		if(output.length >= 1 && output != 'Not Authorized' && output != 'Invaild Method' && output != '[]'){
			if(response_type==true){
				res.writeHead(200, {"Content-Type": 'application/json'});
				res.end(JSON.stringify({ code: 200, result : {"Type":"Results","Output": "Syncing admin"}}));
			}
			logger.log(0, 'Starting Admin users to Sync to Database', 'success', '/api/sync/admin', '');
			_delete_admin (req, res, output);
		}else{
			if(response_type==true){
				helper.not_authorized(req, res);
			}
		}
	}else{
		res.writeHead(200, {"Content-Type": 'application/json'});
		res.end(JSON.stringify({ code: 500, result : {"Type":"Error","Output": "Can not sync at this time. Please wait an hour before trying again."}}));
		logger.log(0, 'Admin users sync can not process due to 1 hour limit has not been met', 'error', '/api/sync/admin', '');
	}
};

async function  _delete_admin (req, res, output){
	var       bucket = cluster.openBucket(abucket_name);
	var           qs = 'DELETE FROM `'+abucket_name+'`;';
	var            q = couchbase.N1qlQuery.fromString(qs);
	q.consistency(couchbase.N1qlQuery.Consistency.REQUEST_PLUS);
	logger.log(0, 'Deleting old admin users from database', 'success', '/api/sync/admin', '');
	await bucket.query(q, function(err, rows) {
		if (!err) {
			_admin_parse (req, res, output);
		} else {
			logger.log(0, 'Error when deleting old admin users', 'error', '/api/sync/admin', err);
			setTimeout(function() {
				_delete_admin (req, res, output);
			}, 1000);
		}
	});
};

async function  _admin_parse (req, res, output, i=0){
	if(i <= (output.length-1)){
		if(i==0){
			logger.log(0, 'Starting to insert Admin users from Sync', 'success', '/api/sync/admin', '');
		}
		var       bucket = cluster.openBucket(abucket_name);
		var           qs = 'INSERT INTO `'+abucket_name+'` ( KEY, VALUE ) VALUES ( UUID(), ' + JSON.stringify(output[i].admin) + ');';
		var            q = couchbase.N1qlQuery.fromString(qs);
		q.consistency(couchbase.N1qlQuery.Consistency.REQUEST_PLUS);
		await bucket.query(q, function(err, rows) {
			if (!err) {
				i++;
				_admin_parse (req, res, output, i);
			} else {
				logger.log(0, 'Error when adding Admin users', 'error', '/api/sync/admin', err);
				setTimeout(function() {
					_admin_parse (req, res, output, i);
				}, 1000);
			}
		});
	}else{
		logger.log(0, 'Syncing of Admin users has finished', 'success', '/api/sync/admin', '');
	}
};

////////////////////////////////////////////////////////////////////////////////////////////////////////////

async function _process_products (req, res) {

	var parms = helper.get_parms(req);

	if(parms!=null){
		console.log(parms);
		if(parms.authkey == master_key){
			var        bucket = cluster.openBucket(pbucket_name);
			var            qs = 'SELECT * FROM `'+pbucket_name+'`;';
			var             q = couchbase.N1qlQuery.fromString(qs);
			q.consistency(couchbase.N1qlQuery.Consistency.REQUEST_PLUS);
			await bucket.query(q, function(err, rows) {
				if (!err) {
					res.writeHead(200, {"Content-Type": 'application/json'});
					res.end(JSON.stringify({ code: 200, result : {"Type":"Results","Output": rows}}));
				} else {
					setTimeout(function() {
						_process_products(req, res);
					}, 1000);
				}
			});
		}else{
			helper.not_authorized(req, res);
		}
	}else{
		helper.not_authorized(req, res);
	}
};

////////////////////////////////////////////////////////////////////////////////////////////////////////////

async function _process_slideshows (req, res) {

	var parms = helper.get_parms(req);

	if(parms!=null){
		console.log(parms);
		if(parms.authkey == master_key){
			var        bucket = cluster.openBucket(ssbucket_name);
			var            qs = 'SELECT * FROM `'+ssbucket_name+'`;';
			var             q = couchbase.N1qlQuery.fromString(qs);
			q.consistency(couchbase.N1qlQuery.Consistency.REQUEST_PLUS);
			await bucket.query(q, function(err, rows) {
				if (!err) {
					res.writeHead(200, {"Content-Type": 'application/json'});
					res.end(JSON.stringify({ code: 200, result : {"Type":"Results","Output": rows}}));
				} else {
					setTimeout(function() {
						_process_products(req, res);
					}, 1000);
				}
			});
		}else{
			helper.not_authorized(req, res);
		}
	}else{
		helper.not_authorized(req, res);
	}
};

////////////////////////////////////////////////////////////////////////////////////////////////////////////

async function _process_admin (req, res) {

	var parms = helper.get_parms(req);

	if(parms!=null){
		console.log(parms);
		if(parms.authkey == master_key){
			var        bucket = cluster.openBucket(abucket_name);
			var            qs = 'SELECT * FROM `'+abucket_name+'`;';
			var             q = couchbase.N1qlQuery.fromString(qs);
			q.consistency(couchbase.N1qlQuery.Consistency.REQUEST_PLUS);
			await bucket.query(q, function(err, rows) {
				if (!err) {
					res.writeHead(200, {"Content-Type": 'application/json'});
					res.end(JSON.stringify({ code: 200, result : {"Type":"Results","Output": rows}}));
				} else {
					setTimeout(function() {
						_process_products(req, res);
					}, 1000);
				}
			});
		}else{
			helper.not_authorized(req, res);
		}
	}else{
		helper.not_authorized(req, res);
	}
};

////////////////////////////////////////////////////////////////////////////////////////////////////////////

async function _push_images (req, res) {
	let stdout = await shell.exec('rclone sync /data/media/ remote:CL-Media ',{silent:true}).stdout;
	res.writeHead(200, {"Content-Type": 'application/json'});
	res.end(JSON.stringify({ code: 200, result : {"Type":"Results","Output": 'Syncing Images'}}));
};

////////////////////////////////////////////////////////////////////////////////////////////////////////////

async function _process_images (req, res,response_type=true) {
	logger.log(0, 'Downloading Images from Backblaze', 'success', '/api/sync/images', "");
	let stdout = await shell.exec('curl '+master_server+'api/sync/push/images -o /dev/null',{silent:true}).stdout;
	stdout = await shell.exec('rclone sync remote:CL-Media /data/media/',{silent:true}).stdout;
	logger.log(0, 'Finished Downloading Images from Backblaze', 'success', '/api/sync/images', "");
	if(response_type==true){
		res.writeHead(200, {"Content-Type": 'application/json'});
		res.end(JSON.stringify({ code: 200, result : {"Type":"Results","Output": 'Syncing Images'}}));
	}
};
////////////////////////////////////////////////////////////////////////////////////////////////////////////

module.exports = {
	get_products : (req, res) => {
		_products(req,res);
	},
	pull_products : (req, res) => {
		_process_products(req,res);
	},
	get_slideshows : (req, res) => {
		_slideshows(req, res);
	},
	pull_slideshows : (req, res) => {
		_process_slideshows(req, res);
	},
	get_images : (req, res) => {
		_push_images(req, res);
	},
	pull_images : (req, res) => {
		_process_images(req, res);
	},
	get_admin : (req, res) => {
		_admin(req, res);
	},
	pull_admin : (req, res) => {
		_process_admin(req, res);
	},
	pull_all : (req, res) => {
		_everything (req, res);
	},
	pull_data : (req, res) => {
		_everything_butimages (req, res);
	},
}