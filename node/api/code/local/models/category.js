'use strict';

let   helper      = require('../helper/response');
const bucket_name = 'categories';
var   couchbase   = require('couchbase');
let   config      = require('../etc/config');
var   cluster     = new couchbase.Cluster(config.get_cb_server());
cluster.authenticate(config.get_cb_username(), config.get_cb_password());
var   bucket      = cluster.openBucket(bucket_name);

var         shell = require('shelljs');
var            fs = require('fs');

async function _select_categories (req, res) {

	if(_doesitpass('./var/tmp/categories.json')){
		let stdout = shell.exec('rm -rf ./var/tmp/categories.json',{silent:true}).stdout;
		var _query = 'SELECT DISTINCT * FROM categories WHERE NOT `name` LIKE \'%/%\' ORDER BY `sort_order`';
		var q = couchbase.N1qlQuery.fromString(_query);
		q.consistency(couchbase.N1qlQuery.Consistency.REQUEST_PLUS);
	
		await bucket.query(q, function(err, rows) {
			if (!err) {
				_select_filters (req, res, rows);
			} else {
				console.log(err);
				setTimeout(function() {
					_select_categories(req, res);
				}, 10000);
			}
		});
	}else{
		var categories_json = JSON.parse(fs.readFileSync('./var/tmp/categories.json'));
		res.writeHead(200, {"Content-Type": 'application/json'});
		res.end(JSON.stringify({ code: 200, result : {"Type":"Results","Output": {"collection" : categories_json}}}));
	}



};

async function _select_filters (req, res, categories, i=0, filter_values=[]) {

	if(i<=categories.length - 1){

		var _query = 'SELECT `category_main`, `category_sub`, `filterValues` FROM `products` where `category_main` = \''+categories[i].categories.name+'\';';

		var q = couchbase.N1qlQuery.fromString(_query);
		q.consistency(couchbase.N1qlQuery.Consistency.REQUEST_PLUS);

		await bucket.query(q, function(err, rows) {
		    if (!err) {
		    	
		    	filter_values[i] = _parse_filters(rows,categories[i]);
				i++;
				_select_filters(req, res, categories, i, filter_values);

		    } else {
		    	console.log(err);
		        setTimeout(function() {
		        	_select_filters(req, res, categories, i, filter_values);
		        }, 10000);
		    }
		});

	}else{
		_select_sub_cat (req, res, 0, filter_values);
	}

};

async function _select_sub_cat (req, res, i=0, filter_values) {

	if(i<=filter_values.length - 1){

		var _query = 'SELECT DISTINCT img, img_thumbnail, sort_order, trim(SPLIT(name,\'/\')[1]) `label` FROM categories WHERE trim(`name`) LIKE \''+ filter_values[i].label +'/%\'';

		var q = couchbase.N1qlQuery.fromString(_query);
		q.consistency(couchbase.N1qlQuery.Consistency.REQUEST_PLUS);

		await bucket.query(q, function(err, rows) {
		    if (!err) {
		    	
				// filter_values[i].subCategories = rows;
				// i++;
				// _select_sub_cat (req, res, i, filter_values);
				_filiter_out_subcategories (req, res, i, filter_values, rows);

		    } else {
		    	console.log(err);
		        setTimeout(function() {
		        	_select_sub_cat (req, res, i, filter_values);
		        }, 10000);
		    }
		});
		
	}else{
		fs.writeFileSync('./var/tmp/categories.json', JSON.stringify(filter_values));
		res.writeHead(200, {"Content-Type": 'application/json'});
		res.end(JSON.stringify({ code: 200, result : {"Type":"Results","Output": {"collection" : filter_values}}}));
	}

};

async function _filiter_out_subcategories (req, res, i=0, filter_values, crows, a=0, nrows=[]) {

	if(a<=crows.length - 1){
		var _query = 'SELECT * FROM products WHERE `category_sub`  = \''+crows[a].label+'\' and `category_main` = \''+filter_values[i].label+'\' limit 1';

		var q = couchbase.N1qlQuery.fromString(_query);
		q.consistency(couchbase.N1qlQuery.Consistency.REQUEST_PLUS);

		await bucket.query(q, function(err, rows) {
		    if (!err) {
		    	if(rows!='' || crows[a].label=='View All' || crows[a].label=='New Intros'){
						nrows.push(crows[a]);    		
		    	}
				a++;
				_filiter_out_subcategories (req, res, i, filter_values, crows, a, nrows);
		    } else {
		    	console.log(err);
		        setTimeout(function() {
		        	_filiter_out_subcategories (req, res, i, filter_values, crows, a, nrows);
		        }, 10000);
		    }
		});

	}else{
		filter_values[i].subCategories = nrows;
		i++;
		_select_sub_cat (req, res, i, filter_values);
	}

}

function _parse_filters(data,categories){

	var collection = {};
	var activeFilterOptions = {};
	var activeFilterLabels = [];
	var data_designer = [];
	var data_finish = [];
	var data_height = [];
	var data_is_instock = [];
	var data_price = [];
	var data_width = [];

	for (var i = 0; i <= data.length - 1; i++) {
		for (var a = 0; a <= (data[i].filterValues.length - 1); a++) {
			activeFilterLabels[activeFilterLabels.length] = data[i].filterValues[a].split(':')[0];
			if(data[i].filterValues[a].split(':')[0]=='designer'){
				data_designer[data_designer.length] = data[i].filterValues[a].split(':')[1];
			}
			if(data[i].filterValues[a].split(':')[0]=='finish'){
				data_finish[data_finish.length] = data[i].filterValues[a].split(':')[1];
			}
			if(data[i].filterValues[a].split(':')[0]=='height'){
				data_height[data_height.length] = data[i].filterValues[a].split(':')[1];
			}
			if(data[i].filterValues[a].split(':')[0]=='is_instock' && data[i].filterValues[a].split(':')[0]!=''){
				data_is_instock[data_is_instock.length] = data[i].filterValues[a].split(':')[1];
			}
			if(data[i].filterValues[a].split(':')[0]=='price'){
				data_price[data_price.length] = data[i].filterValues[a].split(':')[1];
			}
			if(data[i].filterValues[a].split(':')[0]=='width'){
				data_width[data_width.length] = data[i].filterValues[a].split(':')[1];
			}
		}
	}

	if(activeFilterLabels.length>0){
		activeFilterLabels = _removeDuplicates(activeFilterLabels.sort());
	}
	if(data_designer.length>0){
		activeFilterOptions.designer = _removeDuplicates(data_designer.sort());
	}
	if(data_finish.length>0){
		activeFilterOptions.finish = _removeDuplicates(data_finish.sort());
	}
	if(data_height.length>0){
		activeFilterOptions.height = _removeDuplicates(data_height.sort());
	}
	if(data_is_instock.length>0){
		activeFilterOptions.is_instock = _removeDuplicates(data_is_instock.sort());
	}
	if(data_price.length>0){
		activeFilterOptions.price = _removeDuplicates(data_price.sort());
	}
	if(data_width.length>0){
		activeFilterOptions.width = _removeDuplicates(data_width.sort());
	}

	collection = {
			'label'               : categories.categories.name,
			'handle'              : categories.categories.name.toLowerCase(),
			'images'              : [categories.categories.img],
			'thumbnail'           : [categories.categories.img_thumbnail],
			'sort_order'          : [categories.categories.sort_order],
			'activeFilterLabels'  : activeFilterLabels,
			'activeFilterOptions' : activeFilterOptions,
			'subCategories'       : ['empty']
		};

	return collection;
}

function _removeDuplicates(arr){
    let unique_array = []
    for(let i = 0;i < arr.length; i++){
        if(unique_array.indexOf(arr[i]) == -1){
            unique_array.push(arr[i])
        }
    }
    return unique_array
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////

function _doesitpass(filename, limit=86400){
	let file_time = shell.exec('date -r '+filename+' +%s',{silent:true}).stdout;
	let current_time = shell.exec('date +%s',{silent:true}).stdout;
	if ((Number(file_time.trim()) + limit) >= Number(current_time.trim())) {
		return false;
	}else{
		return true;
	}
}

module.exports = {
	get : (req, res) => {
		_select_categories(req,res);
	}
}