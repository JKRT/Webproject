/*
  Displaying the current view, the default is the home view but the value 
   of this function will change in the show* functions */
console.log("Setting global variables");
currentView = function() {};
currentlyViewing = "";
/*
 *  Checks the the password for the signup form is correct. 
 */
function checkSignUp() {
    console.log("Called checkSignUp()");
    if(document.getElementById("password2").value === document.getElementById("repeatPsw").value) {
        var dataObject = {email: document.getElementById("email2").value,
                          password: document.getElementById("password2").value,
                          firstname: document.getElementById("firstName").value,
                          familyname: document.getElementById("familyName").value,
                          gender: document.getElementById("gender").value,
                          city: document.getElementById("city").value,
                          country: document.getElementById("country").value};
        var signUpObject = null;

        var message = {
            "email": dataObject.email,
            "first_name": dataObject.firstname,
            "family_name": dataObject.familyname,
            "gender": dataObject.gender,
            "country": dataObject.country,
            "city": dataObject.city,
            "password": dataObject.password
        };

        var request = new TwiddlerRequest("POST", "/sign_up",
                                          message, signUpHandler);
        request.send();
    }

    return false;
}

/* Reset forms or display 'error' message
 * telling the user that such a user already
 * exists. This is triggered by a HTTP response. */

function signUpHandler(response) {
    signUpObject = JSON.parse(response);
    if(!signUpObject.success) {
        var email2 = document.getElementById("email2");
        email2.setCustomValidity("User already exists!");
    } else {
        //Save the token in the browser...
        document.getElementById("signUpForm").reset();
    }
}

/* Helper function that resets a certain
 * HTML input form element by its validity.
 * This is usually called when a user has
 * entered valid data but has been wrong
 * earlier (making the browser sig. failure). */

function resetValidation (fieldName) {
    console.log("resetValidation() called");
    var field = document.getElementById(fieldName);
    field.setCustomValidity("");    
}

function checkLogin() {
    console.log("Called checkLogin()");
    var email = document.getElementById("email1").value;
    var password = document.getElementById("password1").value;

    var message = {
        "email": email,
        "password": password
    };

    var request = new TwiddlerRequest("POST", "/sign_in",
                                      message, loginHandler);
    request.send();
    return false;
}

/* A successfull login request is handles in the
 * following way. If the user already exists, display
 * a nice message to the user. If the login is good,
 * store the token and attempt to create a socket.
 * Thereafter show the profile view to the user. */

function loginHandler(response) {
    signInObject = JSON.parse(response);
    var email = document.getElementById("email1").value;
    if(!signInObject.success) {
        var email1 = document.getElementById("email1");
        email1.setCustomValidity("User doesn't exist!");
    } else {
        //Save the token in the browser...
        sessionStorage.token = signInObject.data;
        sessionStorage.email = email; // For HMAC.
        // Initiate socket connection here...
        tsocket = new TwiddlerSocket(email, sessionStorage.token);
        console.log("Now waiting for socket response...");
        /*The current view after this should be the home view */
        currentView = showHome;
        displayView();
    }
}

function logout() {
    console.log("logout() called");

    var message = {
        "email": sessionStorage.email
    };

    var request = new TwiddlerRequest("POST", "/sign_out",
                                      message, logoutHandler);
    request.send();
}

/* Upon logout request success, the token
 * is removed (so displayView won't trigger
 * on it and open the profile view) and also
 * close the current socket connection to server. */

function logoutHandler(response) {
    sessionStorage.removeItem("token");
    tsocket.close();
    displayView();
}

/* Observe that the context can only be in browser or home panel mode */
function reloadMessages () { 
    console.log("Current view called");
    currentView(true);
}

/* Handles message posting , if browse is activated we will fetch the email corresponding to
* to the users that we are currently viewing. */
function postMessage() {
    console.log("postMessage() called");
    var recipient = null;
    if(currentView === showBrowse ) {
        // recipient = document.getElementById("email3").value;
        recipient = sessionStorage.currentlyViewing;
        console.log(recipient);
    } else if (currentView === showHome) {
        //set recipient to the user "hack"..
        recipient = document.getElementById("homeEmail").innerHTML;
        recipient = recipient.split(">");
        recipient = recipient[recipient.length - 1];
    }

    console.log("With recipiant:" + recipient);
    var messageContent = document.getElementById("chatBox");
    var mediaObject = document.getElementById("mediaBrowser");

    var message = {
        "semail": sessionStorage.email,
        "message": messageContent.value,
        "email": recipient
    };

    if (mediaObject.length != 0)
        message["media"] = mediaObject.files[0];

    var request = new TwiddlerRequest("POST", "/post_message",
                                      message, postMessageHandler);
    request.send();
}

/* Upon message post success, clear the chat box window
 * so the user doesn't need to manually clear it. Also,
 * remove the possible media content selected earlier. */

function postMessageHandler(response) {
    var messageContent = document.getElementById("chatBox");
    var mediaObject = document.getElementById("mediaBrowser");
    messageContent.value = "";

    /* FulHax below. Normally, browsers do not allow
     * writing directly to the input field since it
     * could imply security and privacy problems. The
     * 'hack' below clones the tag, clearing it too.. */

    mediaObject.innerHTML = mediaObject.innerHTML;
    reloadMessages();
}

function changePassword() {
    console.log("Called changePassword()");

    var message = {
        "oldPassword": document.getElementById("oldPassword").value,
        "newPassword": document.getElementById("newPassword").value,
        "email": sessionStorage.email,
    };

    var request = new TwiddlerRequest("POST", "/change_password",
                                      message, changePasswordHandler);
    request.send();
    return false;
}

function changePasswordHandler(response) {
    messageData = JSON.parse(response);
    if (messageData.success) document.getElementById("changePasswordForm").reset();
}

window.onload = function() {
    tsocket = new TwiddlerSocket(null, sessionStorage.token);
    initPages();
    displayView();
};
