TwiddlerRequest = function(type, route, messages, handler) {
    if (type == "POST") {
        var form = new FormData();
        for (var message in messages) {
            if (messages.hasOwnProperty(message)) {
                form.append(message, messages[message]);
            }
        }
    } else if (type == "GET") {
        var url = "?";
        for (var message in messages) {
            if (messages.hasOwnProperty(message)) {
                url += message + "=" + messages[message] + "&";
            }
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
