var intervalId = 0;
var intervalTime = 250;

newMessages = function () {
    $(".fbNubFlyout.fbDockChatTabFlyout").each(function (index) {
        $(this).find(".uiTextareaAutogrow._552m").css("border-color", "red").css("border-style", "groove").css("border-width", "1px");
        var currentToDecryptId = 0;
        currentToDecryptId = $(this).find("a[href*='www.facebook.com/messages/']").attr("href").split("/")[4];
        $(this).find("._kso.fsm.direction_ltr._55r0").each(function () {
            var textfield = $(this).children("span").children("span");
            var text = textfield.text();
            if (text.substring(0, 13) == "==encrypted==") {
                var toEncrypt = text.substring(13, text.length);
                $(this).css("border-right", "3px solid yellow").css("border", "1px solid yellow");
                textfield.text(rot13x(toEncrypt) + "///" + currentToDecryptId);
            }
        });
    });
    var uri = window.location.pathname;
    if (uri.substring(0, 10) == "/messages/") {
        var currentToDecryptId = 0;
        $("a[data-hovercard*='/ajax/hovercard/hovercard.php?id=']").each(function () {
            if ($(this).closest("span")) {
                //TODO: WICHTIG, VERMUTLICH NICHT GANZ KORREKT!!! PRÜFEN!
                currentToDecryptId = $(this).attr("data-hovercard").split("=")[1].split("&")[0];
                return false;
            }
        });
        //currentToDecryptId = uri.split("/")[2];
        $("._38.direction_ltr").each(function () {
            var textfield = $(this).children("span").children("p");
            var text = textfield.text();
            if (text.substring(0, 13) == "==encrypted==") {
                var toEncrypt = text.substring(13, text.length);
                textfield.css("border-right", "3px solid yellow");
                textfield.text(rot13x(toEncrypt) + "///" + currentToDecryptId);
            }
        });
    }
};

$(window).on("blur focus", function (e) {
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

$(document).ready(function () {
    CheckInterval();
    var userId = $("input[name='targetid']").attr("value");
    if (userId) {
        sessionStorage.setItem("OwnFacebookUserId", userId);
    }
});

function CheckInterval() {
    if (!intervalId) {
        intervalId = window.setInterval(newMessages, intervalTime);
    }
};

function rot13x(s) {

    var rxi = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
    var rxo = "NOPQRSTUVWXYZABCDEFGHIJKLMnopqrstuvwxyzabcdefghijklm5678901234"
    var map = []
    var buf = ""

    for (z = 0; z <= rxi.length; z++) {
        map[rxi.substr(z, 1)] = rxo.substr(z, 1)
    }

    for (z = 0; z <= s.length; z++) {
        var c = s.charAt(z)
        buf += (c in map ? map[c] : c)
    }

    return buf

}