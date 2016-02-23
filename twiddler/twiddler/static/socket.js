tsocket = null;
TwiddlerSocket = function(email, token) {
    var userEmail = email;
    var userToken = token;
    var handle = new WebSocket("ws://localhost:7777/websocket");
    console.log("Connecting to Twiddler WebSocket...");
    console.log("State of connection is '" + handle.readyState + "'.");

    handle.onopen = function(event) {
        console.log("Twiddler WebSocket has opened!");
        console.log("Sending token and email, hoping to gain access...");
	if(userEmail != null)
            data = {email: userEmail, token: userToken};
	else 
	    data = {token:userToken};
        handle.send(JSON.stringify(data));
    };

    this.close = function() { 
	handle.close(); 
    };

    handle.onmessage = function(event) {
	if( event.data === "close" ) {
	    console.log("Logging user out of application...");
	    sessionStorage.removeItem("token");
	    displayView(); 
	}
    };
};



