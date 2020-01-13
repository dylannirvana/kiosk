'use strict';
const couchbase_server_ip = '192.168.99.100';
const couchbase_server_address  = 'couchbase://' + couchbase_server_ip;
const couchbase_server_username = 'root';
const couchbase_server_password = 'docker';

module.exports = {
	get_cb_ip   : () => {
		return couchbase_server_ip;
	},
	get_cb_server   : () => {
		return couchbase_server_address;
	},
	get_cb_username : () => {
		return couchbase_server_username;
	},
	get_cb_password : () => {
		return couchbase_server_password;
	},
}