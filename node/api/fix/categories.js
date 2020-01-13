const cbucket_name  = 'categories';

var     couchbase   = require('couchbase');
const   config      = require('../code/local/etc/config');
var     cluster     = new couchbase.Cluster(config.get_cb_server());

const   downloader  = require('../code/local/helper/downloader');

cluster.authenticate(config.get_cb_username(), config.get_cb_password());

var exec = require('child_process').exec;

const category_n1ql = [
	'INSERT INTO `' + cbucket_name + '` ( KEY, VALUE ) VALUES ( UUID(), {  "name" : "Ceiling", "sort_order" : 0, "img" : "https://s3.amazonaws.com/circa-category-images/1-Home/homepage_1_ceiling.png" } );',
	'INSERT INTO `' + cbucket_name + '` ( KEY, VALUE ) VALUES ( UUID(), {  "name" : "Wall", "sort_order" : 9, "img" : "https://s3.amazonaws.com/circa-category-images/1-Home/homepage_2_wall.png" } );',
	'INSERT INTO `' + cbucket_name + '` ( KEY, VALUE ) VALUES ( UUID(), {  "name" : "Table", "sort_order" : 16, "img" : "https://s3.amazonaws.com/circa-category-images/1-Home/homepage_3_table.png" } );',
	'INSERT INTO `' + cbucket_name + '` ( KEY, VALUE ) VALUES ( UUID(), {  "name" : "Floor", "sort_order" : 21, "img" : "https://s3.amazonaws.com/circa-category-images/1-Home/homepage_4_floor.png" } );',
	'INSERT INTO `' + cbucket_name + '` ( KEY, VALUE ) VALUES ( UUID(), {  "name" : "Outdoor", "sort_order" : 26, "img" : "https://s3.amazonaws.com/circa-category-images/1-Home/homepage_5_outdoor.png" } );',
	'INSERT INTO `' + cbucket_name + '` ( KEY, VALUE ) VALUES ( UUID(), {  "name" : "Fans", "sort_order" : 33, "img" : "https://s3.amazonaws.com/circa-category-images/1-Home/homepage_6_fans.png" } );',
	'INSERT INTO `' + cbucket_name + '` ( KEY, VALUE ) VALUES ( UUID(), {  "name" : "New Introductions", "sort_order" : 50, "img" : "https://s3.amazonaws.com/circa-category-images/1-Home/homepage_6_fans.png" } );',
	'INSERT INTO `' + cbucket_name + '` ( KEY, VALUE ) VALUES ( UUID(), {  "name" : "Ceiling/View All", "sort_order" : 1, "img" : "https://s3.amazonaws.com/circa-category-images/2-Ceiling/ceiling_1_viewall.png" } );',
	'INSERT INTO `' + cbucket_name + '` ( KEY, VALUE ) VALUES ( UUID(), {  "name" : "Ceiling/Chandelier", "sort_order" : 2, "img" : "https://s3.amazonaws.com/circa-category-images/2-Ceiling/ceiling_2_chandelier.png" } );',
	'INSERT INTO `' + cbucket_name + '` ( KEY, VALUE ) VALUES ( UUID(), {  "name" : "Ceiling/Flush Mount", "sort_order" : 3, "img" : "https://s3.amazonaws.com/circa-category-images/2-Ceiling/ceiling_3_flushmount.png" } );',
	'INSERT INTO `' + cbucket_name + '` ( KEY, VALUE ) VALUES ( UUID(), {  "name" : "Ceiling/Pendant", "sort_order" : 4, "img" : "https://s3.amazonaws.com/circa-category-images/2-Ceiling/ceiling_4_pendant.png" } );',
	'INSERT INTO `' + cbucket_name + '` ( KEY, VALUE ) VALUES ( UUID(), {  "name" : "Ceiling/Lantern", "sort_order" : 5, "img" : "https://s3.amazonaws.com/circa-category-images/2-Ceiling/ceiling_5_lantern.png" } );',
	'INSERT INTO `' + cbucket_name + '` ( KEY, VALUE ) VALUES ( UUID(), {  "name" : "Ceiling/Hanging Shade", "sort_order" : 6, "img" : "https://s3.amazonaws.com/circa-category-images/2-Ceiling/ceiling_6_hangingshade.png" } );',
	'INSERT INTO `' + cbucket_name + '` ( KEY, VALUE ) VALUES ( UUID(), {  "name" : "Ceiling/Linear", "sort_order" : 7, "img" : "https://s3.amazonaws.com/circa-category-images/2-Ceiling/ceiling_7_linear.png" } );',
	'INSERT INTO `' + cbucket_name + '` ( KEY, VALUE ) VALUES ( UUID(), {  "name" : "Ceiling/New Intros", "sort_order" : 8, "img" : "https://res-2.cloudinary.com/circa-lighting/image/upload/c_lpad,dpr_1.0,f_auto,q_auto/media/wysiwyg/megamenu/ceiling/Ceiling_New_S19_Menu.png" } );',
	'INSERT INTO `' + cbucket_name + '` ( KEY, VALUE ) VALUES ( UUID(), {  "name" : "Wall/View All", "sort_order" : 10, "img" : "https://s3.amazonaws.com/circa-category-images/3-Wall/wall_1_viewall.png" } );',
	'INSERT INTO `' + cbucket_name + '` ( KEY, VALUE ) VALUES ( UUID(), {  "name" : "Wall/Decorative", "sort_order" : 11, "img" : "https://s3.amazonaws.com/circa-category-images/3-Wall/wall_2_decorative.png" } );',
	'INSERT INTO `' + cbucket_name + '` ( KEY, VALUE ) VALUES ( UUID(), {  "name" : "Wall/Bath", "sort_order" : 12, "img" : "https://s3.amazonaws.com/circa-category-images/3-Wall/wall_3_bath.png" } );',
	'INSERT INTO `' + cbucket_name + '` ( KEY, VALUE ) VALUES ( UUID(), {  "name" : "Wall/Task", "sort_order" : 13, "img" : "https://s3.amazonaws.com/circa-category-images/3-Wall/wall_4_task.png" } );',
	'INSERT INTO `' + cbucket_name + '` ( KEY, VALUE ) VALUES ( UUID(), {  "name" : "Wall/Picture", "sort_order" : 14, "img" : "https://s3.amazonaws.com/circa-category-images/3-Wall/wall_5_picture.png" } );',
	'INSERT INTO `' + cbucket_name + '` ( KEY, VALUE ) VALUES ( UUID(), {  "name" : "Wall/New Intros", "sort_order" : 15, "img" : "https://res-3.cloudinary.com/circa-lighting/image/upload/c_lpad,dpr_1.0,f_auto,q_auto/media/wysiwyg/megamenu/wallmenu/Wall_New_S19_Menu.png" } );',
	'INSERT INTO `' + cbucket_name + '` ( KEY, VALUE ) VALUES ( UUID(), {  "name" : "Table/View All", "sort_order" : 17, "img" : "https://s3.amazonaws.com/circa-category-images/4-Table/table_1_viewall.png" } );',
	'INSERT INTO `' + cbucket_name + '` ( KEY, VALUE ) VALUES ( UUID(), {  "name" : "Table/Decorative", "sort_order" : 18, "img" : "https://s3.amazonaws.com/circa-category-images/4-Table/table_2_decorative.png" } );',
	'INSERT INTO `' + cbucket_name + '` ( KEY, VALUE ) VALUES ( UUID(), {  "name" : "Table/Task", "sort_order" : 19, "img" : "https://s3.amazonaws.com/circa-category-images/4-Table/table_3_task.png" } );',
	'INSERT INTO `' + cbucket_name + '` ( KEY, VALUE ) VALUES ( UUID(), {  "name" : "Table/New Intros", "sort_order" : 20, "img" : "https://res-5.cloudinary.com/circa-lighting/image/upload/c_lpad,dpr_1.0,f_auto,q_auto/media/wysiwyg/megamenu/tablemenu/Table2-min.jpg" } );',
	'INSERT INTO `' + cbucket_name + '` ( KEY, VALUE ) VALUES ( UUID(), {  "name" : "Floor/View All", "sort_order" : 22, "img" : "https://s3.amazonaws.com/circa-category-images/5-Floor/floor_1_viewall.png" } );',
	'INSERT INTO `' + cbucket_name + '` ( KEY, VALUE ) VALUES ( UUID(), {  "name" : "Floor/Decorative", "sort_order" : 23, "img" : "https://s3.amazonaws.com/circa-category-images/5-Floor/floor_2_decorative.png" } );',
	'INSERT INTO `' + cbucket_name + '` ( KEY, VALUE ) VALUES ( UUID(), {  "name" : "Floor/Task", "sort_order" : 24, "img" : "https://s3.amazonaws.com/circa-category-images/5-Floor/floor_3_task.png" } );',
	'INSERT INTO `' + cbucket_name + '` ( KEY, VALUE ) VALUES ( UUID(), {  "name" : "Floor/New Intros", "sort_order" : 25, "img" : "https://res-5.cloudinary.com/circa-lighting/image/upload/c_lpad,dpr_1.0,f_auto,q_auto/media/wysiwyg/megamenu/floormenu/Floor-min.jpg" } );',
	'INSERT INTO `' + cbucket_name + '` ( KEY, VALUE ) VALUES ( UUID(), {  "name" : "Outdoor/View All", "sort_order" : 27, "img" : "https://s3.amazonaws.com/circa-category-images/6-Outdoor/outdoor_1_viewall.png" } );',
	'INSERT INTO `' + cbucket_name + '` ( KEY, VALUE ) VALUES ( UUID(), {  "name" : "Outdoor/Wall ", "sort_order" : 28, "img" : "https://s3.amazonaws.com/circa-category-images/6-Outdoor/outdoor_2_wall.png" } );',
	'INSERT INTO `' + cbucket_name + '` ( KEY, VALUE ) VALUES ( UUID(), {  "name" : "Outdoor/Ceiling", "sort_order" : 29, "img" : "https://s3.amazonaws.com/circa-category-images/6-Outdoor/outdoor_3_ceiling.png" } );',
	'INSERT INTO `' + cbucket_name + '` ( KEY, VALUE ) VALUES ( UUID(), {  "name" : "Outdoor/Post ", "sort_order" : 30, "img" : "https://s3.amazonaws.com/circa-category-images/6-Outdoor/outdoor_4_post.png" } );',
	'INSERT INTO `' + cbucket_name + '` ( KEY, VALUE ) VALUES ( UUID(), {  "name" : "Outdoor/Bollard & Path", "sort_order" : 31, "img" : "https://s3.amazonaws.com/circa-category-images/6-Outdoor/outdoor_5_bollardpath.png" } );',
	'INSERT INTO `' + cbucket_name + '` ( KEY, VALUE ) VALUES ( UUID(), {  "name" : "Outdoor/New Intros", "sort_order" : 32, "img" : "https://res-4.cloudinary.com/circa-lighting/image/upload/c_lpad,dpr_1.0,f_auto,q_auto/media/wysiwyg/megamenu/outdoormenu/Outdoor_New_S19_Menu.png" } );',
	'INSERT INTO `' + cbucket_name + '` ( KEY, VALUE ) VALUES ( UUID(), {  "name" : "Fans/View All", "sort_order" : 34, "img" : "https://s3.amazonaws.com/circa-category-images/7-Fans/fans_1_viewall.png" } );',
	'INSERT INTO `' + cbucket_name + '` ( KEY, VALUE ) VALUES ( UUID(), {  "name" : "Fans/Indoor", "sort_order" : 35, "img" : "https://s3.amazonaws.com/circa-category-images/7-Fans/fans_2_indoor.png" } );',
	'INSERT INTO `' + cbucket_name + '` ( KEY, VALUE ) VALUES ( UUID(), {  "name" : "Fans/Outdoor", "sort_order" : 36, "img" : "https://s3.amazonaws.com/circa-category-images/7-Fans/fans_3_outdoor.png" } );',
	'INSERT INTO `' + cbucket_name + '` ( KEY, VALUE ) VALUES ( UUID(), {  "name" : "Fans/Remotes & Controls", "sort_order" : 37, "img" : "https://s3.amazonaws.com/circa-category-images/7-Fans/fans_4_controls.png" } );',
	'INSERT INTO `' + cbucket_name + '` ( KEY, VALUE ) VALUES ( UUID(), {  "name" : "Fans/Downrods", "sort_order" : 38, "img" : "https://s3.amazonaws.com/circa-category-images/7-Fans/fans_5_downrods.png" } );',
	'INSERT INTO `' + cbucket_name + '` ( KEY, VALUE ) VALUES ( UUID(), {  "name" : "Fans/Accessories", "sort_order" : 39, "img" : "https://s3.amazonaws.com/circa-category-images/7-Fans/fans_6_accessories.png" } );',
	'INSERT INTO `' + cbucket_name + '` ( KEY, VALUE ) VALUES ( UUID(), {  "name" : "Fans/New Intros", "sort_order" : 40, "img" : "https://res-1.cloudinary.com/circa-lighting/image/upload/c_lpad,dpr_1.0,f_auto,q_auto/media/wysiwyg/megamenu/Fans_New_S19_Menu.png" } );'
];

function _install () {
	init();	
}

async function init(i=0,a=0){
    _delete_sql(cbucket_name);
    setTimeout(function() {
        _install_sql(category_n1ql, 0, cbucket_name);
    }, 5000);
}

async function _delete_sql (bucket_name) {

	var _n1ql = 'DELETE FROM `' + cbucket_name + '`;';
	
		var bucket = cluster.openBucket(bucket_name);
		var qs      = _n1ql
		var q       = couchbase.N1qlQuery.fromString(qs);
		q.consistency(couchbase.N1qlQuery.Consistency.REQUEST_PLUS);

		await bucket.query(q, function(err, rows) {
			if (err) {
				console.log(err);
			}
		});
};

async function _install_sql (_n1ql, i=0, bucket_name) {

	if(i <= (_n1ql.length-1)){
		
		var bucket = cluster.openBucket(bucket_name);
		var qs      = _n1ql[i]
		var q       = couchbase.N1qlQuery.fromString(qs);
		q.consistency(couchbase.N1qlQuery.Consistency.REQUEST_PLUS);

		await bucket.query(q, function(err, rows) {
			if (!err) {
				i++;
			}else{
				console.log(err);
			}
			_install_sql(_n1ql, i, bucket_name);
		});
	
	}else{
		_correct_images();
	}

};

async function _correct_images (){
	var qs = 'SELECT meta(`categories`).id, `img` FROM `categories`;';
	var bucket = cluster.openBucket(cbucket_name);
	var q       = couchbase.N1qlQuery.fromString(qs);
	q.consistency(couchbase.N1qlQuery.Consistency.REQUEST_PLUS);

	var file = '';
	var image = '';
	var start = '';
	var end = '';

	await bucket.query(q, async function(err, rows) {
		if (!err) {
			for (var i = 0; i <= rows.length -1; i++) {
				console.log(rows[i].img);
				file = '';
				
				image = rows[i].img
				start = image.lastIndexOf('//');
				end = image.length;
				
				image = image.substring(start+1, end).replace('/s3.amazonaws.com/circa-category-images/','').replace(/\/res-.*.cloudinary.com\/circa-lighting\/image\/upload\/c_lpad,dpr_1.0,f_auto,q_auto\/media\/wysiwyg\/megamenu\//g, '');

				file = await downloader.file(
					rows[i].img, 
					image.toString().replace('/','_').replace('.png',''),
					'category',
					'500');
				_update_category_img(rows[i].id, file);
			}
			setTimeout(function() {
				process.exit(1);
			}, 5000);
		}else{
			console.log(err);
		}
	});
}

async function _update_category_img(id, path){
	var qs = 'UPDATE `categories` SET `img` = \''+path+'\', img_thumbnail = \''+path.replace('category/','category/thumbnail/thumbnail_')+'\' WHERE meta(`categories`).id = \''+id+'\';';
	var bucket  = cluster.openBucket(cbucket_name);
	var q       = couchbase.N1qlQuery.fromString(qs);

	q.consistency(couchbase.N1qlQuery.Consistency.REQUEST_PLUS);

	await bucket.query(q, function(err, rows) {
		if (err) {
			console.log(err);
		}
	});
}


_install();
