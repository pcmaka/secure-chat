var ownEnding = "OWNENDING"; //TODO:change ending
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
		//keyring = new openpgp.Keyring();
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
		console.log(key.keys[0].armor());
		if(key.keys[0].armor()){
			keyring.importKey(key.keys[0].armor());
			keyring.store();
			//keyring = new openpgp.Keyring();
			return true;
		}else{
			return false;
		}
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
			//text = msg.replace(/openpgpjs.org/,"openpgpjs.org\n\n");
			var a = openpgp.key.readArmored(privateKey);
			var m = openpgp.message.readArmored(msg);
			a.keys[0].decrypt("PASSPHRASE");
			try{
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

var privateKeyOne = "-----BEGIN PGP PRIVATE KEY BLOCK-----\n"+
"Version: OpenPGP.js v0.3.2\n"+
"Comment: http://openpgpjs.org\n"+
"\n"+
"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\n"+
"H7SHkss=\n"+
"=5T8n\n"+
"-----END PGP PRIVATE KEY BLOCK-----\n"+
"";

var publicKeyOne = "-----BEGIN PGP PUBLIC KEY BLOCK-----\n"+
"Version: OpenPGP.js v0.3.2\n"+
"Comment: http://openpgpjs.org\n"+
"\n"+
"xo0EUw36EgEEAIVB+X+CPOkze3BZwKLZNJgC3B8Cs+WFpOy9zOVWQiT+XkY1\n"+
"yTClwIwPHKkyei/5kePvlgJdaCs4jNPDhEtPOUERsxYjhHOyH4xyD8o/cohE\n"+
"Eg10nd2/PYWPexe0BHLrYZky2PehtM3/pcuX+IkhhI+8zAmnKoca95x92Qxi\n"+
"sz41ABEBAAHNIjExMDAwMDAyMTk5MDE4OTRAZmFjZW9va0FudGlOU0EuZGXC\n"+
"nwQQAQgAEwUCUw36EwkQjAEX5NN3518CGwMAAM17BACEWvpNm1kRY7+2PuK8\n"+
"V4kJIVH81rfSxm/YTvjQ3f6Jj/ki8pttvjc4f0Q09uH8kBGbUrpytzCvf/VW\n"+
"FmnEkwzRgKlkXX20QBG+V8VrRfsQqZZXrI/t/bybmdcDYLksf+SdA1TXrhpP\n"+
"zBq3HtGx0cRnvajBoqpovql5tKrYZNPHrM6NBFMN+hMBBAC86jZbFK+EWftG\n"+
"r96v+zMrROCqqMSqqNx3MsFL0yys2HC1CwM0uPdHujOOKQz2D8PHM4G74saY\n"+
"go+0LF6XuNkESIm6yYgH07GaD4aE85fuHBWcYIr1VVcySnwgPxUzyVaWUOAo\n"+
"SXmq6LvCRnSGIeI3ZGqUpyXL2U+bgAbz18OdawARAQABwp8EGAEIABMFAlMN\n"+
"+hUJEIwBF+TTd+dfAhsMAAC2OQP/a9yhpOA0uiuDvn7+lh/EK4qA9Q8B80LX\n"+
"OCNmzfihOSk3OfIADf7cp0g923xFHg4V6l/iHy8zrlrLhHoTrlf7d2247/bL\n"+
"2vVjYb8CKf30FdWvpBWmuc6WzWyvt+FTE63k3ZtQwU9WR20GQu42y5jpmc5j\n"+
"ODrM32EnIWH4H7SHkss=\n"+
"=QyAw\n"+
"-----END PGP PUBLIC KEY BLOCK-----\n"+
"\n"+
"";
