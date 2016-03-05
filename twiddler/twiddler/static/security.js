TwiddlerToken = function(token) {
    var token = token;

    /* Hash the message (usually a random string)
     * that will be used to transmit the token
     * securely to the server without revealing it.
     * The salted string is hashed with the token. */

    this.generate = function(message) {
        var hash = new jsSHA("SHA-1", "TEXT");
        hash.setHMACKey(token, "TEXT");
        hash.update(message);
        return hash.getHMAC("HEX");
    };
};
