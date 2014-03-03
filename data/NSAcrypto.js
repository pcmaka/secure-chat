var ownEnding = "@facebooksecurechat"; //TODO:change ending
var keyring = new openpgp.Keyring();
var NSAcrypt;
var decryptedMsgs = [];
var privateKey;

NSAcrypt = {

    generateKeys: function (facebookID) {
        var id = facebookID + ownEnding;
        var keyPair = openpgp.generateKeyPair(1, 1024, id, "PASSPHRASE");
		keyring.importKey(keyPair.privateKeyArmored);
		keyring.importKey(keyPair.publicKeyArmored);
		privateKey = keyPair.privateKeyArmored;
		keyring.store();
    },
	
	hasPrivateKey: function(facebookID){
		var id = facebookID + ownEnding;
		var key = keyring.getPrivateKeyForAddress(id);
		if(key.length==0){
			return false;
		}else{
			privateKey = key[0].armor();
			return true;
		}
	},
	
	clearKeys: function(){
		keyring.clear();
		keyring.store();
		keyring = new openpgp.Keyring();
	},
	
	getPrivateKey: function(facebookID){
		var id = facebookID + ownEnding;
		var key = keyring.getPrivateKeyForAddress(id);
		if(key.length==1){
			return key[0].armor();
		}
	},
	
	addPublicKey: function(keyString){
		var key;
		try{
			key = openpgp.key.readArmored(keyString);
		}catch(e){
			return false;
		}
		if(key.keys[0].armor()){
			keyring.importKey(key.keys[0].armor());
			keyring.store();
			return true;
		}else{
			return false;
		}
	},
	
	removePublicKey: function(facebookID){
		var id = facebookID + ownEnding;
		var key = keyring.getPublicKeyForAddress(id);
		for(var i = 0; i<keyring.keys.length;i++){
			if(keyring.keys[i] == key[0]){
				keyring.removeKey(i);
				keyring.store();
				return true;
			}
		}
		return false;
	},
	
	getPublicKey: function(facebookID){
		var id = facebookID + ownEnding;
		var key = keyring.getPublicKeyForAddress(id);
		if(key.length==1){
			return key[0].armor();
		}
	},
	
	decrypt: function(msg){
		var decrypted;
		for(var i = 0; i < decryptedMsgs.length; i++)
		{
			if(decryptedMsgs[i].org == msg)
			{
				decrypted = decryptedMsgs[i].msg;
				break;
			}
		}
		if(!decrypted)
		{
			var orgmsg = msg;
			var msgarray = msg.split("openpgpjs.org");
			var basearray = msgarray[1].split("-----END PGP MESSAGE-----");
			basearray[0] = basearray[0].replace(/[^\S\n\r]/g,"+");
			msg = msgarray[0]+"openpgpjs.org\n\n"+basearray[0]+"-----END PGP MESSAGE-----"+basearray[1];
			try{
				var a = openpgp.key.readArmored(privateKey);
				var m = openpgp.message.readArmored(msg);
				a.keys[0].decrypt("PASSPHRASE");
				decrypted = openpgp.decryptMessage(a.keys[0],m);
			}catch(e){
				decrypted = e;
			}
			decryptedMsgs.push({org:orgmsg,msg:decrypted});
		}
		if(decrypted){
			return unescape(decrypted);
		}
	}
};
