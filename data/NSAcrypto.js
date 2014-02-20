var ownEnding = "OWNENDING"; //TODO:change ending
var keyring = new openpgp.Keyring();
var NSAcrypt;

NSAcrypt = {
    generateKeys: function (facebookID, password) {
        var id = facebookID + ownEnding;
        var keyPair = openpgp.generateKeyPair(1, 1024, id, password);
		keyring.importKey(keyPair.privateKeyArmored);
		keyring.importKey(keyPair.publicKeyArmored);
		keyring.store();
    },
	hasPrivateKey: function(facebookID){
		var id = facebookID + ownEnding;
		var key = keyring.getPrivateKeyForAddress(id);
		if(key.length==0){
			return false;
		}else{
			return true;
		}
	},
	clearKeys: function(){
		keyring.clear();
		console.log("cleared");
		keyring.store();
	}
};


