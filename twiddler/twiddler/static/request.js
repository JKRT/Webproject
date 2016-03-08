TwiddlerRequest = function(type, route, messages, handler) {
    salt = Math.random().toString(36).substr(2, 16);
    var token = new TwiddlerToken(sessionStorage.token);
    console.log("Request for " + route + " of type " + type + ".");
    console.log("The following data isf being sent to the server:");

    /*Append data to the form in case of HTTP POST*/
    if (type == "POST") {
        var form = new FormData();
        for (var message in messages) {
            if (messages.hasOwnProperty(message)) {
                console.log(message + ": " + messages[message]);
                form.append(message, messages[message]);
            }
        }

        if (route != "/sign_in"
            && route != "/sign_up") {
            form.append("salt", salt);
            console.log("salt: " + salt);
            hmac_token = token.generate(salt);
            form.append("hmac", hmac_token);
            console.log("hmac: " + hmac_token);
        }
	/*Construct the URL in the case of a HTTP GET*/
    } else if (type == "GET") {
        var url = "?";
        for (var message in messages) {
            if (messages.hasOwnProperty(message)) {
                console.log(message + ": " + messages[message]);
                url += message + "=" + messages[message] + "&";
            }
        }

        if (route != "/sign_in"
            && route != "/sign_up") {
            url += "salt=" + salt + "&";
            console.log("salt: " + salt);
            hmac_token = token.generate(salt);
            url += "hmac=" + hmac_token;
            console.log("hmac: " + hmac_token);
        }
    }

    this.send = function() {
        xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
            if (xhttp.readyState == 4
                && xhttp.status == 200) {
                handler(xhttp.responseText);
            }
        };

        if (type == "POST") {
            xhttp.open(type, route, true);
            xhttp.send(form);
        } else if (type == "GET") {
            xhttp.open(type, route + url, true);
            xhttp.send();
        }
    };
};
