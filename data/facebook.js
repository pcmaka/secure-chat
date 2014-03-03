var intervalId = 0;
var intervalTime = 500;
var ownID = 0;

newMessages = function(){
	$(".fbNubFlyout.fbDockChatTabFlyout").each(function(index){
		var currentToDecryptId = 0;
		currentToDecryptId = $(this).find("a[href*='www.facebook.com/messages/']").attr("href").split("/")[4];
		var options = $(this).find("a[aria-label='Optionen']").next().find(".uiMenuInner");
		if(!options.find("a[id='"+currentToDecryptId+"crypto']").length){
			var addPubKeyHTML = "<li class='uiMenuItem'><a class='itemAnchor' role='menuitem' tabindex='0' id='"+currentToDecryptId+"crypto'><span class='itemLabel fsm'>Public Key eingeben</span></a></li>";
			var ownPrivKeyHTML = "<li class='uiMenuItem'><a class='itemAnchor' role='menuitem' tabindex='0' id='"+currentToDecryptId+"privkey'><span class='itemLabel fsm' >Eigener Private Key</span></a></li>";
			var ownPublicKeyHTML = "<li class='uiMenuItem'><a class='itemAnchor' role='menuitem' tabindex='0' id='"+currentToDecryptId+"pubkey'><span class='itemLabel fsm' >Eigener Public Key</span></a></li>";
			var trenner = "<li class='uiMenuSeparator'></li>";
			options.html(addPubKeyHTML + ownPrivKeyHTML + ownPublicKeyHTML + trenner + options.html());
			options.find("a[id='"+currentToDecryptId+"crypto']").click(function(){
				publicKeyPrompt("Bitte Public Key für User "+currentToDecryptId+" einfügen:");
			});
			options.find("a[id='"+currentToDecryptId+"privkey']").click(function(){
				var privKey = NSAcrypt.getPrivateKey(ownID);
				window.alert(privKey);
			});
			options.find("a[id='"+currentToDecryptId+"pubkey']").click(function(){
				var pubKey = NSAcrypt.getPublicKey(ownID)
				window.alert(pubKey);
			});
		}
		var pubkey = NSAcrypt.getPublicKey(currentToDecryptId); 
		if(pubkey){
			var key =[];
			key[0] = currentToDecryptId;
			key[1] = pubkey;
			self.port.emit("publicKey",key);
			options.find("a[id='"+currentToDecryptId+"crypto']").unbind();
			options.find("a[id='"+currentToDecryptId+"crypto']").text("Public Key anzeigen");
			options.find("a[id='"+currentToDecryptId+"crypto']").click(function(){
				window.alert(NSAcrypt.getPublicKey(currentToDecryptId));
			});
			$(this).find(".uiTextareaAutogrow._552m").css("border-color","red").css("border-style","groove").css("border-width","1px");
			//$(this).find("._kso.fsm.direction_ltr._55r0").each(function(){
			$(this).find("span._5yl5").each(function(){
				var textfield = $(this).children("span");
				var text = textfield.text();
				if (text.substring(0, 27) == "-----BEGIN PGP MESSAGE-----") {
					decrypted = NSAcrypt.decrypt(text+"\n");
					textfield.text(decrypted);
					textfield.css("border-right","3px solid yellow");
				}
			});
		}
	});
	var uri = window.location.pathname;
	if(uri.substring(0,10)=="/messages/"){
		var currentToDecryptId = 0;
		$("a[data-hovercard*='/ajax/hovercard/hovercard.php?id=']").each(function(){
			if($(this).closest("span")){
				//TODO: PRÜFEN, OB IMMER KORREKT!
				currentToDecryptId = $(this).attr("data-hovercard").split("=")[1].split("&")[0];
				return false;
			}
		});
		$("._38.direction_ltr").each(function(){
			var textfield = $(this).children("span").children("p");
			var text = textfield.text();
			if (text.substring(0, 27) == "-----BEGIN PGP MESSAGE-----") {
				decrypted = NSAcrypt.decrypt(text+"\n");
				textfield.text(decrypted);
				textfield.css("border-right","3px solid yellow");
			}
		});
	}
};

publicKeyPrompt = function (text){
	self.port.emit("show",text);
	/**var keyString = window.prompt(text);
	if(keyString){
		if (keyString.substring(0, 36) == "-----BEGIN PGP PUBLIC KEY BLOCK-----") {
			if(!NSAcrypt.addPublicKey(keyString)){
				publicKeyPrompt("Fehlerhafter Key!\n"+text);
			}else{
				window.alert("Public Key gespeichert!");
			}
		}else{
			publicKeyPrompt("Fehlerhafter Key!\n"+text);
		}
	}**/
}

self.port.on("okKey",function(keyString){
	if(keyString){
		if (keyString.substring(0, 36) == "-----BEGIN PGP PUBLIC KEY BLOCK-----") {
			if(!NSAcrypt.addPublicKey(keyString)){
				publicKeyPrompt("Fehlerhafter Key! Bitte erneut einfügen!");
			}else{
				window.alert("Public Key gespeichert!");
			}
		}else{
			publicKeyPrompt("Fehlerhafter Key! Bitte erneut einfügen!");
		}
	}
});

$(window).on("blur focus", function(e) {
    var prevType = $(this).data("prevType");

    if (prevType != e.type) {   //  reduce double fire issues
        switch (e.type) {
            case "blur":
                window.clearInterval(intervalId);
				intervalId = 0;
                break;
            case "focus":
				CheckInterval();
                break;
        }
    }

    $(this).data("prevType", e.type);
});

$(document).ready(function(){
	CheckInterval();
	ownID = getOwnId(ownID);
	//ownID = sessionStorage.getItem("ownID");
	if(ownID && !NSAcrypt.hasPrivateKey(ownID) && !sessionStorage.getItem("firstRun")){
		console.log("firstrun");
		sessionStorage.setItem("firstRun","true");
		var date = new Date();
		//TODO: Möglichkeit eigene Keys einzugeben
		window.alert("Neue Keys werden generiert!\r\n\r\nDies kann einige Minuten dauern,\r\nFirefox bitte nicht beenden!\r\n\r\nZum starten OK klicken\r\n\r\n"+ date);
		NSAcrypt.generateKeys(ownID);
		window.alert("Keys bitte sicher aufbewahren!");
		window.alert(NSAcrypt.getPrivateKey(ownID));
		window.alert(NSAcrypt.getPublicKey(ownID));
		self.port.emit("loaded",true);
	}else{
		if(ownID && NSAcrypt.hasPrivateKey(ownID)){
			var keys = [];
			keys[0] = NSAcrypt.getPrivateKey(ownID);
			keys[1] = NSAcrypt.getPublicKey(ownID);
			self.port.emit("ownKeys",keys);
			window.alert("Private Key found");
			//window.alert("Private Key Found!");
			//Kommentar entfernen zum testweise löschen der Keys
			//NSAcrypt.clearKeys();
		}
	}
});

function CheckInterval(){
	if(!intervalId){
		intervalId = window.setInterval(newMessages,intervalTime);
	}
};

function getOwnId(tempOwnID){
	if(!ownID){
		var tempID = $("._s0.headerTinymanPhoto._rw.img").attr("id");
		if(tempID){
			tempOwnID = tempID.split("_")[3];
			sessionStorage.setItem("ownID",tempOwnID);
		}
	}
	return tempOwnID;
};

function encrypt(s){
    return (s ? s : this).split('').map(function(_)
    {
        if (!_.match(/[A-za-z]/)) return _;
        c = Math.floor(_.charCodeAt(0) / 97);
        k = (_.toLowerCase().charCodeAt(0) - 83) % 26 || 26;
        return String.fromCharCode(k + ((c == 0) ? 64 : 96));
    }).join('');
}

self.port.on("messageEncrypt",function(msgData){
	console.log("bin drin");
	var encrypted = encrypt(msgData[1]);
	msgData[1] = encrypted;
	self.port.emit("messageSend",msgData);
});