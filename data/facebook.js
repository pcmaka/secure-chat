var intervalId = 0;
var intervalTime = 250;
var ownID = 0;

newMessages = function(){
	$(".fbNubFlyout.fbDockChatTabFlyout").each(function(index){
		$(this).find(".uiTextareaAutogrow._552m").css("border-color","red").css("border-style","groove").css("border-width","1px");
		var currentToDecryptId = 0;
		currentToDecryptId = $(this).find("a[href*='www.facebook.com/messages/']").attr("href").split("/")[4];
		$(this).find("._kso.fsm.direction_ltr._55r0").each(function(){
			var textfield = $(this).children("span").children("span");
			var text = textfield.text();
			if (text.substring(0, 13) == "==encrypted==") {
				var toEncrypt = text.substring(13,text.length);
				$(this).css("border-right","3px solid yellow").css("border","1px solid yellow");
				//textfield.text(encrypt(toEncrypt)+"///"+currentToDecryptId);
				textfield.text("asd");
			}
		});
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
				//var toEncrypt = text.substring(27,text.length);
				textfield.css("border-right","3px solid yellow");
				var test = text.replace(/openpgpjs.org/,"openpgpjs.org\n\n");
				textfield.text("asd");
				decrypted = NSAcrypt.decrypt(test+"\n");
				//textfield.text(encrypt(toEncrypt)+"///"+currentToDecryptId);
				textfield.text(decrypted);
			}
		});
	}
};

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
	if(ownID && !NSAcrypt.hasPrivateKey(ownID) && !sessionStorage.getItem("firstRun")){
		console.log("firstrun");
		sessionStorage.setItem("firstRun","true");
		var date = new Date();
		//TODO: Möglichkeit eigene Keys einzugeben
		window.alert("Neue Keys werden generiert!\r\n\r\nDies kann einige Minuten dauern,\r\nFirefox bitte nicht beenden!\r\n\r\n"+ date);
		NSAcrypt.generateKeys(ownID,"test");
	}else{
		if(ownID && NSAcrypt.hasPrivateKey(ownID)){
			var PrivateKey = NSAcrypt.getPrivateKey(ownID);
			self.port.emit("privateKey",PrivateKey);
			window.alert("Private Key Found!");
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