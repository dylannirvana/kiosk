const Cryptr      = require('cryptr');
const pass_secret = '9$v81Ykj$t6U9TE7NZck09vu2bN4j9H5J&L^0fW9D4TR19cq4606d4SE40s*';
const form_secret = 'Wq#81c2IJzSg11S#379u8o0aEdwh370Kj3I4n37xqY0X2966jiNk509l0';

var crypto = require('crypto'),
    algorithm = 'aes-256-ctr';

var bcrypt = require('bcryptjs');

function _encrypt(text='', secret){
	let encryptedString = '';
	if(text!=''){
		const cryptr = new Cryptr(secret);
		encryptedString = cryptr.encrypt(text);
	}
	return encryptedString;
}

function _decrypt(text='', secret){
	let decryptedString = '';
	if(text!=''){
		const cryptr = new Cryptr(secret);
		decryptedString = cryptr.decrypt(text);
	}	
	return decryptedString;
}

module.exports = {
	encrypt: (text='') => {
		let val = _encrypt(text.toString(), pass_secret);
		return val;
	},
	password_encrypt : (text='') => {
		var salt = bcrypt.genSaltSync(10);
		var hash = bcrypt.hashSync(text, salt);

		return hash;
	},
	password_check : (text='',hash='') => {
		return bcrypt.compareSync(text, hash);
	},
	decrypt: (text='') => {
		let val = _decrypt(text.toString(), pass_secret);
		return val;
	},
	formkey: (text='') => {
		let val = _encrypt(text.toString(), form_secret);
		return val;
	},
	is_allowed : (text='') => {
		let val = '';
		if(text.toString().length >= 16){
			val = _decrypt(text.toString(), form_secret);
		}else{
			val = 0;
		}
		// let _is_allowed = true;
		let _is_allowed = false;
		if((Number(val) + 10800) >= Math.floor(new Date() / 1000)){
			//console.log('allowed');
			_is_allowed=true;
		}
		return _is_allowed;
	}
}