// This is an active module of the pcmaka (2) Add-on
var data = require("sdk/self").data;
var pageMod = require("sdk/page-mod");
var {Cc, Ci, Cu, Cr, Cm, components} = require("chrome");
Cu.import("resource://gre/modules/NetUtil.jsm");
var channel;

var httpRequestObserver = {
    //Observer hinzuf�gen
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
                console.log("Message send");
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
                            console.log(msg);
                        }
                    }
                }
            }
            httpRequestObserver.sendChannel(postStr, encrypt(msg));
        }
    },

    sendChannel: function (postStr, encryptedMsg) {

        //changing the postdata
        var splitstr = postStr.split("&");
        postStr = "";
        for (i = 0; i < splitstr.length; i++) {
            if (splitstr[i].indexOf("message_batch[0][body]") === 0) {
                msgstr = splitstr[i].split("=");
                if (msgstr[1] != "") {
                    msgstr[1] = encryptedMsg;
                    msgstr[1] = "==encrypted==" + msgstr[1];
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
        //var uploadChannel = channel.QueryInterface(Ci.nsIUploadChannel);
        channel.setUploadStream(stringStream, "application/x-www-form-urlencoded", -1);
        channel.requestMethod = "POST";

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
function encrypt(s) {
    return (s ? s : this).split('').map(function (_) {
        if (!_.match(/[A-za-z]/)) return _;
        c = Math.floor(_.charCodeAt(0) / 97);
        k = (_.toLowerCase().charCodeAt(0) - 83) % 26 || 26;
        return String.fromCharCode(k + ((c == 0) ? 64 : 96));
    }).join('');
}
httpRequestObserver.init();

pageMod.PageMod({
    include: "*.facebook.com",
    contentScriptFile: [    data.url("jquery-2.0.3.min.js"),
        data.url("openpgp.min.js"),
        data.url("facebook.js")]
});