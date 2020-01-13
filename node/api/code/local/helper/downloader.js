var shell = require('shelljs');
var fs = require('fs');
var path = require('path');
var mediaPath = '/data/media/images/';

const log_file = './var/tmp/feed_log.text'
fs.truncate(log_file, 0, () => {})
function write_log(text) {
	fs.appendFile(log_file, text + '\n', () => {})
}

function _create_directory(path) {
	if (!fs.existsSync(path)) fs.mkdirSync(path);
}

function _download_main_file(main_file_name, url) {
	return new Promise((resolve, reject) => {
		if (!fs.existsSync(main_file_name)) {
			const file_query = shell.exec("curl " + url + ' -o ' + main_file_name, {silent:true}).stdout;
			resolve(main_file_name)
			return
		}
		resolve(main_file_name)
	})
}

let count = 0
async function _download_file(url, file, path, size=140){
	count++
	const base_dir = mediaPath;
	const file_url = url.replace('https://','http://');
	const extension = url.split(".")[url.split(".").length-1];
	const main_file_name = base_dir + path + '/' + file + '.' + extension
	const required_images = [
		{
			key: 'thumbnail',
			path: base_dir + path,
			query: (file_name, mutated_file_name) => "convert " + file_name + " -resize " + size + "x " + mutated_file_name
		},
		{
			key: 'cropped',
			path: base_dir + path,
			query: (file_name, mutated_file_name) => "convert " + file_name + " -trim " + mutated_file_name
		}
	]

	if (!fs.existsSync("./media/")) shell.exec("ln -s /data/media/ ./media",{silent:true}).stdout;
	if (!fs.existsSync(base_dir)) shell.exec("mkdir "+ base_dir ,{silent:true}).stdout;

	const main_file_path = await _download_main_file(main_file_name, url)
	const downloadImages = required_images.map(img => {
		const base_file_name = img.path + '/' + file + '.' + extension
		const mutated_file_name = img.path + (img.key ? `/${img.key}/${img.key}_` : '/') + file + '.' + extension

		_create_directory(img.path + (img.key ? `/${img.key}` : ''))
		// console.log(img.path + (img.key ? `/${img.key}` : ''));

		return new Promise((resolve, reject) => {
			if (!fs.existsSync(mutated_file_name)) {
				const file_query = shell.exec(img.query(base_file_name, mutated_file_name), {silent:true}).stdout;
				resolve(mutated_file_name)
				return
			}
			resolve(mutated_file_name)
		})
	})

	return new Promise((resolve, reject) => {
			Promise.all(downloadImages).then((images) => {
				resolve('/static/media/' + main_file_name.split('/media/')[1])
			});
	})
}

module.exports = {
	file : (url, file, path ,size) => {
		return _download_file(url, file, path ,size);
	}
}