'use strict';

var couchbase   = require('couchbase');
var sizeOf = require('image-size');
let config      = require('../etc/config');
var cluster     = new couchbase.Cluster(config.get_cb_server());
cluster.authenticate(config.get_cb_username(), config.get_cb_password());
var bucket      = cluster.openBucket('data-feed');
var sbucket     = cluster.openBucket('settings');
var pbucket     = cluster.openBucket('products');
var fs = require('fs');
var logger      = require('./logger');


const   downloader  = require('../helper/downloader');
var           shell = require('shelljs');

const wait_timer = 3600;
let data_feed_items = 0;
const check_rows = () => {
	const _query = couchbase.N1qlQuery.fromString('SELECT * FROM `data-feed`');
	return new Promise((resolve, reject) => {
		bucket.query(_query, (err, rows) => {
			if (err) {
				console.log('_process_blank_base_code error2:', err);
				reject(err)
				return
			}
			resolve(rows.length)
			console.log('rows.length: ', rows.length)
		});
	})
}

const log_file = './var/tmp/feed_log.text'
fs.truncate(log_file, 0, () => {})
function write_log(text) {
	fs.appendFile(log_file, text + '\n', () => {})
}

function chunk_array(array, size) {
	const chunked_arr = [];
	for (let i = 0; i < array.length; i++) {
		const last = chunked_arr[chunked_arr.length - 1];
		if (!last || last.length === size) {
			chunked_arr.push([array[i]]);
		} else {
			last.push(array[i]);
		}
	}
	return chunked_arr;
}

function download_images(images) {
	const image_groups = chunk_array(images, 100)
	let groups_ready = 0
	return new Promise((resolve, reject) => {
		image_groups.map((group, index) => {
			setTimeout(() => {
				const image_group = group.map(async (image, index2) => {
					let start = image.lastIndexOf('//');
					let end = image.length;
					const stripped_image = image.substring(start + 1, end).replace('/circaskin.circalighting.com/media/catalog/product/','');
					const image_downloaded = await downloader.file(image, stripped_image.toString().replace(/\//g,'_').replace(/\./g,'_').replace('png','').replace(/\_$/, ''), 'product')
					console.log(`Image group ${index}, number ${index2}`)
					return image_downloaded
				})
				Promise.all(image_group).then((image_group) => {
					groups_ready++
					write_log(`${groups_ready} out of ${image_groups.length} are ready`)
					if (groups_ready === image_groups.length) resolve(true)
				})
			}, index * 250)
		})
	})
}
// .replace(/\_$/, '')
async function json_sql(element, index) {
	let image = element['Image Url'];
	let start = image.lastIndexOf('//');
	let end = image.length;
	image = image.substring(start + 1, end).replace('/circaskin.circalighting.com/media/catalog/product/','');

	const base_dir = "/static/media/images/";
	const extension = element['Image Url'].split(".")[element['Image Url'].split(".").length - 1];
	const main_file = base_dir + 'product' + '/' + image.toString().replace(/\//g,'_').replace(/\./g,'_').replace('png','').replace(/\_$/, '') + '.' + extension
	const cropped_img_dimensions = fs.existsSync(main_file.replace('/product/','/product/cropped/cropped_').replace('/static/', '')) ? sizeOf(main_file.replace('/product/','/product/cropped/cropped_').replace('/static/', '')) : 0

	const return_val = {
		sort_order: element['Sort Order'],
		sku: element['Sku'],
		base_code: element['Basecode'],
		name: element['Name'],
		new_item: element['new_item'],
		parent_name: element['Parent Name'],
		category: element['Category'].replace(' > ','/').split('/')[0],
		sub_category: element['Category'].replace(' > ','/').split('/')[1],
		category_img: '',
		function: element['Function'],
		z_details: {
			price: element['Price'],
			designer: element['Designer'],
			main_img: main_file,
			thumb_img: main_file.replace('/product/','/product/thumbnail/thumbnail_'),
			cropped_img: main_file.replace('/product/','/product/cropped/cropped_'),
			cropped_img_ratio: cropped_img_dimensions.width / cropped_img_dimensions.height,
			description: element['Description'],
			data_sheet: element['Datasheet Url'],
			cad_block: element['Instalaltion Url'],
			other_imgs: element['Additional Image Url'],
			chain_length: element['Chain Length'],
			inventory: element['Inventory Count'],
			fhp: element['Fixture Height Percentage'],
			size_axis: element['Sizing-axis'],
			size_axis_height: element['Height'],
			size_axis_width: element['Width'],
			z_criteria: json_filters([
				element['Criteria 1'],
				element['Criteria 2'],
				element['Criteria 3'],
				element['Criteria 4'],
				element['Criteria 5'],
				element['Criteria 6']
			]),
			z_options: json_filters([
				element['Label 1'],
				element['Label 2'],
				element['Label 3'],
				element['Label 4'],
				element['Label 5'],
				element['Label 6'],
				element['Label 7'],
				element['Label 8'],
				element['Label 8'],
				element['Label 10']
			])
		}
	};

	if (typeof return_val.sub_category == 'undefined' || return_val.sub_category == '') {
		return_val.sub_category = 'NA';
	}
	if (typeof return_val.category == 'undefined' || return_val.category == '') {
		return_val.category = 'NA';
	}

	return return_val
};

function json_filters(filters) {
	let return_ouput = {};

	filters.map(filter => {
		if(!filter.includes(':')) return
		const filterObj = filter.split(':')
		if(filterObj[0].length <= 20) {
			const return_key = filterObj[0].toLowerCase()
			return_ouput[return_key] = filterObj[1].trim();
		}
	})

	return return_ouput;
}

function process_chunks(chunks, index) {
	return new Promise((resolve, reject) => {
		const process_chunk = (chunks, index) => {
			const products = chunks[index].map(async (product, index) => {
				const reformatted_json = await json_sql(product, index);
				const product_exist = await _has_record(reformatted_json);
				const action = product_exist ? 'update' : 'insert'

				return product_exist ? await _update_sql(reformatted_json) : await _insert_sql(reformatted_json)
			})

			Promise.all(products).then(async (products) => {
				const count = chunks.length === index + 1 ? data_feed_items : 50 * (index + 1)
				const check_data_feed_status = setInterval(() => {
					check_rows().then(resp => {
						if (count === resp && chunks.length === index + 1) {
							resolve(true)
							clearInterval(check_data_feed_status)
							return
						}

						if (count === resp) {
							index++
							clearInterval(check_data_feed_status)
							process_chunk(chunks, index)
						}
					})
				}, 2500)
			})
		}
		process_chunk(chunks, index)
	})
}

function process_csv_file(req, res) {
	write_log('Processing CSV')
	const csvtojson = require('csvtojson');
	const csvFilePath = './var/tmp/product_feed.csv';
	const feedUrls = [
		'https://www.circalighting.com/media/big_screen/circa_catalog_big_screen.csv'
	]
	let stdout = shell.exec('curl ' + feedUrls[0] + ' -o ' + csvFilePath, {silent:true}).stdout;
	const jsonArray = csvtojson({ noheader:false, output: "json"}).fromFile(csvFilePath);

	stdout = shell.exec('curl -X POST -u root:docker http://' + config.get_cb_ip() + ':8091/pools/default/buckets/data-feed/controller/doFlush',{silent:true}).stdout;
	stdout = shell.exec('rm -rf ./var/tmp/categories.json',{silent:true}).stdout;
	logger.log(0, 'Attempted to download csv', 'success', '/sync/feed', '');

	jsonArray.then(async (products) => {
		products = products.filter(product => product['Basecode'] != '')

		// Commenting out limiter for production testing
		// By: Ryan Turner
		// products = products.filter((product, index) => index < 100)

		data_feed_items = products.length
		write_log(`Got ${products.length} products`)
		logger.log(0, 'addings products to feed', 'success', '/sync/feed', '');

		const images = products.map(product => product['Image Url'])
		write_log(`Checking ${images.length} products for new images`)

		const images_ready = await download_images(images)
		write_log('Images Ready')

		const product_chunks = chunk_array(products, 50)
		const chunks_ready = await process_chunks(product_chunks, 0)

		write_log('Data Feed Ready, starting product grouping')
		_process_categories();
	}).catch(err => {
		console.log({err})
	})
}

function _check_settings (req, res) {
	write_log('Checking settings')
	const _query = couchbase.N1qlQuery.fromString('SELECT meta(feed).id, * FROM `settings` feed where `name` = \'feed/info\' LIMIT 1;');
	sbucket.query(_query, (err, rows) => {
			write_log('Getting bucket')
	    if (err) {
				console.log('_check_settings error:', err);
				logger.log(0, 'Error Processing feed', 'error', '/sync/feed', err);
				_check_settings(req, res);
				return
				// setTimeout(function() {
				//   _check_settings(req, res);
				// },500);
			}
			write_log('No error in bucket')

			const feed_last_updated_ts = Number(rows[0].feed.last_updated)
			const current_ts =  Math.floor(new Date() / 1000)
			let feed_update_buffer_ready = feed_last_updated_ts + wait_timer  <= current_ts

			// Note: Comment this line off when testing for faster workflow
			// feed_update_buffer_ready = true // Todo: Setting this to true for testing, remove this line before going live

			if ( feed_update_buffer_ready ){
				logger.log(0, 'Starting to process feed', 'success', '/sync/feed', err);
				process_csv_file(req, res);
				res.writeHead(200, {"Content-Type": 'application/json'});
				res.end(JSON.stringify({ code: 200, result : {"Type":"Results","Output":"Feed Processing"}}));
				return
			}

			res.writeHead(200, {"Content-Type": 'application/json'});
			res.end(JSON.stringify({ code: 200, result : {"Type":"Error","Output":"Feed is all ready processing"}}));
	});
}

function _has_record (item) {
	const _query = couchbase.N1qlQuery.fromString('SELECT meta(feed).id, * FROM `data-feed` feed where base_code = \'' + item.base_code + '\' and sku = \'' + item.sku + '\' LIMIT 1;');

	return new Promise((resolve, reject) => {
		bucket.query(_query, (err, rows) => {
			if (err) {
				// _has_record(data, obj_p, i);
				logger.log(0, _query.options.statement, 'failed', '/sync/feed', err);
				reject(err)
				return
			}

			resolve(rows != '' ? true : false)
		});
	});
};

function _update_settings () {
	const current_ts = Math.floor(new Date() / 1000)
	const _query = couchbase.N1qlQuery.fromString('update `settings` set `value` = \'processing\', `last_updated` = \'' +current_ts + '\' where `name` = \'feed/info\';');

	return new Promise((resolve, reject) => {
		sbucket.query(_query, (err) => err ? reject(err) : resolve(true) );
	})
}

function _update_sql (item) {
	const stringifyItem = JSON.stringify(item)
	const _query = couchbase.N1qlQuery.fromString('update `data-feed` set `data-feed` = ' + stringifyItem + ' where base_code = \'' + item.base_code + '\' and sku = \'' + item.sku + '\';');

	return new Promise((resolve, reject) => {
		bucket.query(_query, (err) => {
			if (err) {
				console.log('_update_sql error:', err)
				logger.log(0, _query.options.statement, 'failed', '/sync/feed', err);
				reject(err)
				return
			}

			resolve(true)
		});
	})

};

function _insert_sql (item) {
	const stringifyItem = JSON.stringify(item)
	const _query = couchbase.N1qlQuery.fromString('INSERT INTO `data-feed` ( KEY, VALUE ) VALUES ( UUID(), ' + stringifyItem + ');');

	return new Promise((resolve, reject) => {
		bucket.query(_query, (err) => {
			if (err) {
				console.log('_insert_sql error:', err);
				logger.log(0, _query.options.statement, 'failed', '/sync/feed', err);
				reject(err)
				return
			}

			resolve(true)
		});
	});
};

async function _process_categories(){
	const _query = couchbase.N1qlQuery.fromString('DELETE FROM `products`;');
	const req = await bucket.query(_query);

	req.on('end', (meta) => {
		_process_blank_base_code();
	});
}

async function _process_blank_base_code(){
	const _qsa = couchbase.N1qlQuery.fromString('DELETE FROM `data-feed` where base_code =\'\';');
	const req = await bucket.query(_qsa);

	req.on('end', (meta) => {
		const _query = couchbase.N1qlQuery.fromString('SELECT DISTINCT '
			+ '    tbl.base_code, '
			+ '    tbl.category `category_main`, '
			+ '    tbl.sub_category `category_sub`, '
			+ '    CASE '
			+ '        WHEN tbl.parent_name = \'\' THEN name '
			+ '        ELSE tbl.parent_name '
			+ '    END AS `name` '
			+ 'FROM '
			+ '    `data-feed` tbl '
			+ 'ORDER BY `sort_order`; ');

		bucket.query(_query, (err, rows) => {
			if (err) {
				console.log('_process_blank_base_code error:', err);
				_process_categories();
				return
			}
			_process_details(rows);
		});
	});
}

async function _process_details(data, i=''){
	var variant_info = [];
	if (i == '') i = 0

	if (data.length!=i ) {
		const _query = 'SELECT DISTINCT '
					 + '    tbl.* '
					 + 'FROM '
					 + '    `data-feed` tbl '
					 + 'WHERE '
					 + '    tbl.`base_code` = \'' + data[i].base_code + '\' '
					 + 'AND '
					 + '    tbl.`category` = \'' + data[i].category_main + '\' '
					 + 'AND '
					 + '    tbl.`sub_category` = \'' + data[i].category_sub + '\' '
					 + 'ORDER BY '
					 + '    tbl.sort_order ASC ';


		var q = couchbase.N1qlQuery.fromString(_query);
		await bucket.query(q, function(err, rows) {
			if (err) {
				console.log(err);
				_process_details(data, i);
				return
			}

			var filter = [];
			var sortorder = rows[0].sort_order;
			var is_instock = [ 'is_instock:false' ];
			for (var ii = 0; ii <= rows.length - 1; ii++) {
				const is_in_stock = rows[ii].z_details.inventory >= 1
				if (is_in_stock) {is_instock[0] = 'is_instock:true';}
				variant_info[ii]=_format_variant(rows[ii]);
				filter = filter.concat(_format_filter_options(rows[ii]));
			}

			filter = filter.concat(is_instock);
			var filter = _removeDuplicates(filter.sort());

			_has_record_product(data, i, variant_info, filter, sortorder);
		});
		return
	}
	_update_settings();

	console.log('finished import');
}

async function _has_record_product(data, i='', variant_info, filter, sort_order){

	const _query = 'SELECT DISTINCT '
				 + '    meta(tbl).id, '
				 + '    tbl.* '
				 + 'FROM '
				 + '    `products` tbl '
				 + 'WHERE '
				 + '    tbl.`base_code` = \'' + data[i].base_code + '\' '
				 + 'AND '
				 + '    tbl.`category_main` = \'' + data[i].category_main + '\' '
				 + 'AND '
				 + '    tbl.`category_sub` = \'' + data[i].category_sub + '\' ';


	var q = couchbase.N1qlQuery.fromString(_query);
	await pbucket.query(q, function(err, rows) {
		if (!err) {
			if(rows!=''){
				_update_record_product(data, i, variant_info, filter, sort_order);
			}else{
				_insert_record_product(data, i, variant_info, filter, sort_order);
			}
		} else {
			console.log(err);
			setTimeout(function() {
				_has_record_product(data, i, variant_info, filter, sort_order);
			}, 10000);
		}
	});
}

async function _insert_record_product(data, i='', variant_info, filter, sortorder){

	let record = {
		base_code     : data[i].base_code,
		category_main : data[i].category_main,
		category_sub  : data[i].category_sub,
		name          : data[i].name,
		sort_order    : sortorder,
		variations    : variant_info,
		filterValues  : filter
	}

	const _query = 'INSERT INTO `products` ( KEY, VALUE ) VALUES ( UUID(), ' + JSON.stringify( record ) + ');'

	var q = couchbase.N1qlQuery.fromString(_query);
	await pbucket.query(q, function(err, rows) {
		if (!err) {
			i++;
			_process_details(data, i);
		} else {
			console.log(err);
			setTimeout(function() {
				_insert_record_product(data, i, variant_info, filter, sortorder);
			}, 10000);
		}
	});
}

async function _update_record_product(data, i='', variant_info, filter, sortorder){

	let record = {
		base_code     : data[i].base_code,
		category_main : data[i].category_main,
		category_sub  : data[i].category_sub,
		name          : data[i].name,
		sort_order    : sortorder,
		variations    : variant_info,
		filterValues  : filter
	}

	const _query = 'UPDATE `products` SET `products` = ' + JSON.stringify( record ) + ' '
				 + 'WHERE '
				 + '    `base_code` = \'' + data[i].base_code + '\' '
				 + 'AND '
				 + '    `category_main` = \'' + data[i].category_main + '\' '
				 + 'AND '
				 + '    `category_sub` = \'' + data[i].category_sub + '\' ';

	var q = couchbase.N1qlQuery.fromString(_query);
	await pbucket.query(q, function(err, rows) {
		if (!err) {
			i++;
			_process_details(data, i);
		} else {
			console.log(err);
			setTimeout(function() {
				_update_record_product(data, i, variant_info, filter, sortorder);
			}, 10000);
		}
	});
}

function _format_variant(element){

	let is_instock = false;
	if (element.z_details.inventory >= 1)
		is_instock = true;

	var variant = {
		name          		: element.name,
		new_item          : element.new_item,
		sku           		: element.sku,
		sort_order    		: element.sort_order,
		category      		: element.category,
		category_sub  		: element.sub_category,
		cad_block     		: element.z_details.cad_block,
		chain_length  		: element.z_details.chain_length,
		data_sheet    		: element.z_details.data_sheet,
		description   		: element.z_details.description,
		designer      		: element.z_details.designer,
		main_img      		: element.z_details.main_img,
		thumb_img     		: element.z_details.thumb_img,
		cropped_img   		: element.z_details.cropped_img,
		cropped_img_ratio : element.z_details.cropped_img_ratio,
		other_imgs    		: element.z_details.other_imgs,
		price         		: element.z_details.price,
		inventory     		: element.z_details.inventory,
		fhp           		: element.z_details.fhp,
		size_axis     		: element.z_details.size_axis,
		size_axis_height  : element.z_details.size_axis_height,
		size_axis_width   : element.z_details.size_axis_width,
		is_instock    		: is_instock,
		z_criteria    		: element.z_details.z_criteria,
		z_options     		: element.z_details.z_options,
	};

	return variant;
}

function _format_filter_options(element){
	let iii = 0;
	let my_val = [];
	if(element.z_details.z_options.finish){
		my_val[iii] = 'finish:'+element.z_details.z_options.finish;
		iii++;
	}

	if(element.z_details.z_criteria.height){
		my_val[iii] = 'height:'+element.z_details.z_criteria.height;
		iii++;
	}
	if(element.z_details.z_criteria.width){
		my_val[iii] = 'width:'+element.z_details.z_criteria.width;
		iii++;
	}
	if(element.z_details.designer){
		my_val[iii] = 'designer:'+element.z_details.designer;
		iii++;
	}
	if(element.z_details.price){
		my_val[iii] = 'price:'+element.z_details.price;
		iii++;
	}
	return my_val;
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

module.exports = {
	processs : (req, res) => {
		console.log('Staring process!!')
		_check_settings(req,res);
	}
}