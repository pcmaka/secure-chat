var data = require("sdk/self").data;
var NSAcrypto = require("./NSAcrypto.main");
var pageMod = require("sdk/page-mod");
var {Cc, Ci, Cu, Cr, Cm, components} = require("chrome");
Cu.import("resource://gre/modules/NetUtil.jsm");
var channel;
var PrivateKey = null;

var httpRequestObserver = {
    //Observer hinzufuegen
    init: function () {
        var observerService = Cc["@mozilla.org/observer-service;1"].getService(Ci.nsIObserverService);
        observerService.addObserver(this, "http-on-modify-request", false);
    },
	
    //Observer entfernen
    uninit: function () {
        var observerService = Cc["@mozilla.org/observer-service;1"].getService(Ci.nsIObserverService);
        observerService.removeObserver(this, "http-on-modify-request", false);
    },
	
    //wird vom Observer aufgerufen, wenn ein Packet beobachtet wurde
    observe: function (aSubject, aTopic, aData) {
        channel = aSubject.QueryInterface(Ci.nsIHttpChannel);
        if (aTopic == "http-on-modify-request") {
            if ((channel.originalURI.host === "www.facebook.com") && (channel.originalURI.path === "/ajax/mercury/send_messages.php")) {
                console.log("Message observe");
                channel = channel.QueryInterface(Ci.nsIUploadChannel);
                var uploadStream = channel.uploadStream;
                uploadStream.QueryInterface(Ci.nsISeekableStream).seek(Ci.nsISeekableStream.NS_SEEK_SET, 0);
                var stream = Cc["@mozilla.org/binaryinputstream;1"].createInstance(Ci.nsIBinaryInputStream);
                stream.setInputStream(uploadStream);
                var postBytes = stream.readByteArray(stream.available());
                var postStr = String.fromCharCode.apply(null, postBytes);

                var splitStr = postStr.split("&");
                var msg;
                for (i = 0; i < splitStr.length; i++) {
                    if (splitStr[i].indexOf("message_batch[0][body]") === 0) {
                        msgstr = splitStr[i].split("=");
                        if (msgstr[1] != "") {
                            msg = msgstr[1];
							this.forceCaching(channel);
                            console.log(msg);
                        }
                    }
                }
            }
			if(msg && postStr){
				var msgData = new Array();
				msgData[0] = postStr;
				msgData[1] = msg;
				//var mfm = NSAcrypto.test(PrivateKey);
				var encmsg = NSAcrypto.encrypt(msg);
				//console.log("mfm "+mfm);
				//console.log(channel);
				//fbencrypt(msgData);
				
				//obere Zeile geht nicht : untere auskommentierte geht
				httpRequestObserver.sendChannel(postStr, encmsg);
            }else{
				httpRequestObserver.sendChannel(postStr, msg);
			}
        }
    },

    sendChannel: function (postStr, encryptedMsg) {
		//changing the postdata
		if(postStr && encryptedMsg){
			console.log(channel);
        }
		var splitstr = postStr.split("&");
        postStr = "";
        for (i = 0; i < splitstr.length; i++) {
            if (splitstr[i].indexOf("message_batch[0][body]") === 0) {
                msgstr = splitstr[i].split("=");
                if (msgstr[1] != "") {
                    msgstr[1] = encryptedMsg;
                    //msgstr[1] = "==encrypted==" + msgstr[1];
                    msgstr = msgstr[0].concat("=", msgstr[1]);
                    console.log(msgstr);
                    postStr = postStr.concat("&", msgstr);
                } else {
                    postStr = postStr.concat("&", splitstr[i]);
                }
            } else {
                postStr = postStr.concat("&", splitstr[i]);
            }
        }

        var stringStream = Cc["@mozilla.org/io/string-input-stream;1"].createInstance(Ci.nsIStringInputStream);
        stringStream.setData(postStr, postStr.length);
        channel.setUploadStream(stringStream, "application/x-www-form-urlencoded", -1);
        channel.requestMethod = "POST";
    },
	
	forceCaching : function(request) {
		// we only care if we were a POST, GET's cache no matter what
		console.log("forceCaching loaded");
		if (request.requestMethod == "POST") {
			console.log("forceCaching post");
			if (request.loadFlags & Ci.nsIRequest.INHIBIT_CACHING) {
				console.log("forceCaching loadFlags")
				request.loadFlags = request.loadFlags & ~Ci.nsIRequest.INHIBIT_CACHING;
				console.log("Forcing cache on request: [" + request.URI.asciiSpec + "]");
			}
		}
	},
	
    // we are faking an XPCOM interface, so we need to implement QI
    QueryInterface: function (aIID) {
        if (aIID.equals(Ci.nsISupports) ||
            aIID.equals(Ci.nsIInterfaceRequestor) ||
            aIID.equals(Ci.nsIChannelEventSink) ||
            aIID.equals(Ci.nsIProgressEventSink) ||
            aIID.equals(Ci.nsIHttpEventSink) ||
            aIID.equals(Ci.nsIStreamListener)) {
            return this;
        }
        throw Cr.NS_NOINTERFACE;
    }
};

httpRequestObserver.init();

pageMod.PageMod({
    include: "*.facebook.com",
    contentScriptFile: [data.url("jquery-2.0.3.min.js"),
						data.url("openpgp.min.js"),
						data.url("NSAcrypto.js"),
						data.url("facebook.js")],
	onAttach: function(worker){
		worker.port.on("privateKey",function(pk){
			PrivateKey = pk;
		});
	}
});