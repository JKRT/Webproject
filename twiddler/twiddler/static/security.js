TwiddlerToken = function(token) {
    var token = token;
    this.generate = function(message) {
        var hash = new jsSHA("SHA-1", "TEXT");
        hash.setHMACKey(token, "TEXT");
        hash.update(message);
        return hash.getHMAC("HEX");
    };
};
