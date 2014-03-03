var openpgp = require('./src/index.js');
var ownEnding = "@facebooksecurechat"; //TODO:change ending
var NSAcrypt;

NSAcrypt = {	
	encrypt: function(msgData){
		var keys = [];
		var ownKey = openpgp.key.readArmored(msgData[1]);
		var toKey = openpgp.key.readArmored(msgData[2]);
		keys[0] = ownKey.keys[0];
		keys[1] = toKey.keys[0];
		var encrypted = openpgp.opgp.encryptMessage(keys,msgData[0]);
		return encrypted;
	}
};

module.exports = NSAcrypt;