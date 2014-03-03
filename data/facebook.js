var intervalId = 0;
var intervalTime = 500;
var ownID = 0;

newMessages = function(){
	$(".fbNubFlyout.fbDockChatTabFlyout").each(function(index){
		var currentToDecryptId = 0;
		currentToDecryptId = $(this).find("a[href*='www.facebook.com/messages/']").attr("href").split("/")[4];
		if(currentToDecryptId.substring(0,12)!="conversation"){
			var options = $(this).find("a[aria-label='Optionen']").next().find(".uiMenuInner");
			if(!options.find("a[id='"+currentToDecryptId+"crypto']").length && NSAcrypt.hasPrivateKey(ownID)){
				var addPubKeyHTML = "<li class='uiMenuItem'><a class='itemAnchor' role='menuitem' tabindex='0' id='"+currentToDecryptId+"crypto'><span class='itemLabel fsm'>Public Key eingeben</span></a></li>";
				var removeKeyHTML = "<li class='uiMenuItem'><a class='itemAnchor' role='menuitem' tabindex='0' id='"+currentToDecryptId+"remove'><span class='itemLabel fsm' >Public Key löschen</span></a></li>";
				var ownPrivKeyHTML = "<li class='uiMenuItem'><a class='itemAnchor' role='menuitem' tabindex='0' id='"+currentToDecryptId+"privkey'><span class='itemLabel fsm' >Eigener Private Key</span></a></li>";
				var ownPublicKeyHTML = "<li class='uiMenuItem'><a class='itemAnchor' role='menuitem' tabindex='0' id='"+currentToDecryptId+"pubkey'><span class='itemLabel fsm' >Eigener Public Key</span></a></li>";
				var trenner = "<li class='uiMenuSeparator'></li>";
				options.html(addPubKeyHTML + ownPrivKeyHTML + ownPublicKeyHTML + removeKeyHTML + trenner + options.html());
				options.find("a[id='"+currentToDecryptId+"crypto']").click(function(){
					publicKeyPrompt("Bitte Public Key für User "+currentToDecryptId+" einfügen:");
				});
				options.find("a[id='"+currentToDecryptId+"privkey']").click(function(){
					var privKey = NSAcrypt.getPrivateKey(ownID);
					window.alert(privKey);
				});
				options.find("a[id='"+currentToDecryptId+"pubkey']").click(function(){
					var pubKey = NSAcrypt.getPublicKey(ownID);
					window.alert(pubKey);
				});
				options.find("a[id='"+currentToDecryptId+"remove']").click(function(){
					var removed = NSAcrypt.removePublicKey(currentToDecryptId);
					if(removed){
						self.port.emit("removedPublicKey",currentToDecryptId);
						window.alert("Removed");
					}else{
						window.alert("Kein Key vorhanden");
					}
				});
			}else if(!NSAcrypt.hasPrivateKey(ownID)){
				options.find("a[id='"+currentToDecryptId+"crypto']").remove();
				options.find("a[id='"+currentToDecryptId+"privkey']").remove();
				options.find("a[id='"+currentToDecryptId+"pubkey']").remove();
				options.find("a[id='"+currentToDecryptId+"remove']").remove();
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
				
				//new CSS
				$(this).find("span._5yl5").each(function(){
					var textfield = $(this).children("span");
					var text = textfield.text();
					if (text.substring(0, 27) == "-----BEGIN PGP MESSAGE-----") {
						decrypted = NSAcrypt.decrypt(text+"\n");
						textfield.text(decrypted);
						textfield.closest("div._5w1r._5wdf").css("border","1px solid yellow");
					}
				});
				
				//old CSS
				$(this).find("._kso.fsm.direction_ltr._55r0").each(function(){
					var textfield = $(this).children("span").children("p");
					var text = textfield.text();
					if (text.substring(0, 27) == "-----BEGIN PGP MESSAGE-----") {
						decrypted = NSAcrypt.decrypt(text+"\n");
						textfield.text(decrypted);
						textfield.css("border","1px solid yellow");
					}
				});
			}else{
				options.find("a[id='"+currentToDecryptId+"crypto']").unbind();
				options.find("a[id='"+currentToDecryptId+"crypto']").text("Public Key eingeben");
				options.find("a[id='"+currentToDecryptId+"crypto']").click(function(){
					publicKeyPrompt("Bitte Public Key für User "+currentToDecryptId+" einfügen:");
				});
			}
		}
	});
	var uri = window.location.pathname;
	if(uri.substring(0,10)=="/messages/"){
		var currentToDecryptId = 0;
		$("a[data-hovercard*='/ajax/hovercard/hovercard.php?id=']").each(function(){
			if($(this).closest("span")){
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
}
var userKeys = "<li id='securechatsetting' role='menuitem'><a class='navSubmenu' >Secure Chat</a></li>";
var clearKeys = "<li id='securechatreset' role='menuitem'><a class='navSubmenu' >Alle Keys löschen</a></li>";
var divider = "<li id='securechatdivider' class='menuDivider'></li>";
$("#userNavigation").prepend(divider).prepend(clearKeys);

function prependsetting(){
	$("#userNavigation").prepend(userKeys);
	$("#securechatsetting").click(function(){
		privateKeyPrompt();
	});
}
prependsetting();

$("#securechatreset").click(function(){
	if(window.confirm("Wollen Sie wirklich alle Schlüssel löschen?")){
		NSAcrypt.clearKeys();
		if(!$("#securechatsetting").length){
			prependsetting();
		}
	}
});

privateKeyPrompt = function(){
	var popupbg = "<div id='popupbg' style='width:100%;height:100%;position:absolute;background: rgba(0,0,0,.5);z-index:99999999;display: table-cell;text-align: center;vertical-align: middle;'></div>";
	var popup = "<div id='popup' style='width:800px;height:500px;margin-top:50px;display:inline-block;background-color:lightgrey;border-radius:20px;z-index:999999999'></div>";
	var popupin =	"<label id='headerlabel' style='display:inline-block;margin:10px;margin-bottom:0px;width:100%;height:25px;'>Bitte beide eigenen Keys eingeben!</label>"+
					"<label id='privpromptlabel' style='display:inline-block;margin:10px;margin-bottom:0px;width:360px;height:25px;'>Private Key</label>"+
					"<label id='pubpromptlabel' style='display:inline-block;margin:10px;margin-bottom:0px;width:360px;height:25px;'>Public Key</label>"+
					"<br/>"+
					"<textarea id='privedit-box' style='margin: 10px;margin-top:0px;width: 360px;height: 400px; resize: none; '></textarea>"+
					"<textarea id='pubedit-box' style='margin: 10px;margin-top:0px;width: 360px;height: 400px; resize: none; '></textarea>"+
					"<br/>"+
					"<button id='okbutton' style='margin-left:10px;width:120px;height:25px;'> OK </button>"+
					"<button id='cancelbutton' style='margin-left:10px;width:120px;height:25px;'> Cancel</button>"+
					"<button id='generatebutton' style='margin-left:10px;width:120px;height:25px;'> Neu Generieren </button>";
	$("._li").first().prepend(popupbg);
	$("#popupbg").prepend(popup);
	$("#popup").prepend(popupin);
	
	$("#okbutton").click(function(){
		var keys = [];
		keys[0] = $("#privedit-box").val();
		keys[1] = $("#pubedit-box").val();
		savePrivKeys(keys);
		$("#popupbg").remove();
	});
	$("#cancelbutton").click(function(){
		$("#privedit-box").val("");
		$("#pubedit-box").val("");
		$("#popupbg").remove();
	});
	$("#generatebutton").click(function(){
		$("#privedit-box").val("");
		$("#pubedit-box").val("");
		$("#popupbg").remove();
		generateNewKeyPair();
	});
}

self.port.on("okKey",function(keyString){
	if(keyString){
		if (keyString.substring(0, 36) == "-----BEGIN PGP PUBLIC KEY BLOCK-----") {
			var saveSuccess = NSAcrypt.addPublicKey(keyString);
			if(!(saveSuccess === "success")){
				publicKeyPrompt(saveSuccess +"\r\n Bitte erneut einfügen!");
			}else{
				self.port.emit("publicKey",keyString);
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
				ownID = getOwnId(ownID);
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
		sessionStorage.setItem("firstRun","true");
		
		//TODO: Möglichkeit eigene Keys 
		privateKeyPrompt();
		/**window.alert("Neue Keys werden generiert!\r\n\r\nDies kann einige Minuten dauern,\r\nFirefox bitte nicht beenden!\r\n\r\nZum starten OK klicken\r\n\r\n");
		NSAcrypt.generateKeys(ownID);
		self.port.emit("ownKeys",keys);
		window.alert("Keys bitte sicher aufbewahren!");
		window.alert(NSAcrypt.getPrivateKey(ownID));
		window.alert(NSAcrypt.getPublicKey(ownID));
		CheckInterval();**/
	}else{
		if(ownID && NSAcrypt.hasPrivateKey(ownID)){
			var keys = [];
			keys[0] = NSAcrypt.getPrivateKey(ownID);
			keys[1] = NSAcrypt.getPublicKey(ownID);
			self.port.emit("ownKeys",keys);
			window.alert("Private Key found");
			$("#securechatsetting").remove();
		}
	}
});

function generateNewKeyPair(){
	ownID = getOwnId(ownID);
	window.alert("Neue Keys werden generiert!\r\n\r\nDies kann einige Minuten dauern,\r\nFirefox bitte nicht beenden!\r\n\r\nZum starten OK klicken\r\n\r\n");
	NSAcrypt.generateKeys(ownID);
	var keys = [];
	keys[0] = NSAcrypt.getPrivateKey(ownID);
	keys[1] = NSAcrypt.getPublicKey(ownID);
	self.port.emit("ownKeys",keys);
	window.alert("Keys bitte sicher aufbewahren!");
	window.alert(NSAcrypt.getPrivateKey(ownID));
	window.alert(NSAcrypt.getPublicKey(ownID));
	$("#securechatsetting").remove();
}

function savePrivKeys(keys){
	if(keys){
		if (keys[0].substring(0, 37) == "-----BEGIN PGP PRIVATE KEY BLOCK-----" && keys[1].substring(0, 36) == "-----BEGIN PGP PUBLIC KEY BLOCK-----") {
			var privKeySuccess = NSAcrypt.addPrivateKey(keys[0]);
			var pubKeySuccess = NSAcrypt.addPublicKey(keys[1]);
			if(privKeySuccess && (pubKeySuccess === "success")){
				var ownKeys = [];
				ownKeys[0] = NSAcrypt.getPrivateKey(ownID);
				ownKeys[1] = NSAcrypt.getPublicKey(ownID);
				self.port.emit("ownKeys",ownKeys);
				window.alert("Keys gespeichert!");
				$("#securechatsetting").remove();
			}else{
				NSAcrypt.removePublicKey(ownID);
				NSAcrypt.removePrivateKey(ownID);
				privateKeyPrompt();
			}
		}else{
			privateKeyPrompt();
		}
	}
}

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