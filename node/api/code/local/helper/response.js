'use strict';

////////////////////////////////////////////////////////////////////////////////////////////////////////////

function _id_blank(req, res){
	output_response(req, res, 500,"User id is empty. Please Try again.");
};

function _acl_blank(req, res){
	output_response(req, res, 500,"ACL is empty. Please Try again.");
};

function _email_blank(req, res){
	output_response(req, res, 500,"Email is empty. Please Try again.");
};

function _name_blank(req, res){
	output_response(req, res, 500,"Name is empty. Please Try again.");
};

function _user_pasword(req, res){
	output_response(req, res, 500,"Passwords do not match. Please Try again.");
};

function _user_pasword_blank(req, res){
	output_response(req, res, 500,"Password can not be empty. Please Try again.");
};

function _user_blank(req, res){
	output_response(req, res, 500,"Username is empty. Please Try again.");
};

function _user_exist(req, res){
	output_response(req, res, 500,"User already exist. Please Try again.");
};

function _user_na_exist(req, res){
	output_response(req, res, 500,"User id does not exist. Please Try again.");
};

function _not_authorized(req, res){
	output_response(req, res, 401,"Not Authorized");
};

function _invaild_login(req, res){
	output_response(req, res, 401,"Invaild Login information");
};

function _place_holder(req, res){
	output_response(req, res, 200,"Place Holder");
};

function output_response(req, res, output_code, output){
	res.writeHead(output_code, {"Content-Type": 'application/json'});
	res.end(JSON.stringify({ code: output_code, result : {"Type":"Results","Output":output}}));
};


function _get_parms(req){

	var parms = req.params;
	var body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
	var query = req.query;
	var myprams = {};
	let prop = '';

	prop = '';
	for (prop in parms ) {
		myprams[prop] = parms[prop];
	}

	prop = '';
	for (prop in body ) {
		myprams[prop] = body[prop];
	}

	prop = '';
	for (prop in query ) {
		myprams[prop] = query[prop];
	}

	return myprams;
};

////////////////////////////////////////////////////////////////////////////////////////////////////////////


module.exports = {
	id_blank : (req, res) => {
		_id_blank(req, res);
	},
	acl_blank : (req, res) => {
		_acl_blank(req, res);
	},
	email_blank : (req, res) => {
		_email_blank(req, res);
	},
	name_blank : (req, res) => {
		_name_blank(req, res);
	},
	user_pasword : (req, res) => {
		_user_pasword(req, res);
	},
	user_pasword_blank : (req, res) => {
		_user_pasword_blank(req, res);
	},
	user_blank : (req, res) => {
		_user_blank(req, res);
	},
	user_exist : (req, res) => {
		_user_exist(req, res);
	},
	user_na_exist : (req, res) => {
		_user_na_exist(req, res);
	},
	not_authorized : (req, res) => {
		_not_authorized(req, res);
	},
	invaild_login : (req, res) => {
		_invaild_login(req, res);
	},
	place_holder : (req, res) => {
		_place_holder(req, res);
	},
	get_parms : (req, res) => {
		return _get_parms(req, res);
	},
}
