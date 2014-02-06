/**
 * Created by Max on 24.01.14.
 */

function init() {
};

function encrypt(msg, pubKey) {
    // read public key
    var pub_key = openpgp.key.readArmored($('#pubkey').text());
    // encrypt message
    var pgp_message = openpgp.encryptMessage(pubKey, msg);

    return pgp_message;
};

function decrypt(msg) {
};

