TwiddlerRequest = function(type, route, messages, handler) {
    salt = Math.random().toString(36).substr(2, 16);
    var token = new TwiddlerToken(sessionStorage.token);

    if (type == "POST") {
        var form = new FormData();
        for (var message in messages) {
            if (messages.hasOwnProperty(message)) {
                form.append(message, messages[message]);
            }
        }

        if (route != "/sign_in"
            || route != "/sign_up") {
            form.append("salt", salt);
            form.append("hmac", token.generate(salt));
        }
    } else if (type == "GET") {
        var url = "?";
        for (var message in messages) {
            if (messages.hasOwnProperty(message)) {
                url += message + "=" + messages[message] + "&";
            }
        }
        if (route != "/sign_in"
            || route != "/sign_up") {
            url += "salt=" + salt + "&";
            url += "hmac=" + token.generate(salt);
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
