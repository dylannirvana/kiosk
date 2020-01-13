'use strict';

const sharp = require('sharp');
const fs = require('fs');
const helper = require('../helper/response');

async function _get_image (req, res) {
	const parms = helper.get_parms(req);

	sharp(`media/images/${parms.imageType}/${parms.imagePath}`)
		.resize(parseInt(parms.width), null)
		.toBuffer()
		.then(data => { 
			res.contentType('image/png');
			res.send(data);
		})
		.catch(err => {
			console.log(err)
		});
};

module.exports = {
	get : (req, res) => {
		_get_image(req, res);
	}
}