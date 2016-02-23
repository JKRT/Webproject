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
        var signUpObject = null; // serverstub.signUp(dataObject);

        var xhttp = new XMLHttpRequest();
        xhttp.open("POST", "/sign_up", true);
        xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        xhttp.send("email=" + dataObject.email +
                "&first_name=" + dataObject.firstname +
                "&family_name=" + dataObject.familyname +
                "&gender=" + dataObject.gender +
                "&country=" + dataObject.country +
                "&city=" + dataObject.city +
                "&password=" + dataObject.password);

        xhttp.onreadystatechange = function() {
            // Waiting for request to finish, 4 when response is ready.
            if (xhttp.readyState == 4 && xhttp.status == 200) {
                signUpObject = JSON.parse(xhttp.responseText);
                if(!signUpObject.success) {
                    var email2 = document.getElementById("email2");
                    email2.setCustomValidity("User already exists!");
                } else {
                    //Save the token in the browser...
                    document.getElementById("signUpForm").reset();
                }
            }
        };
    }

    return false;
}

function resetValidation (fieldName) {
    console.log("resetValidation() called");
    var field = document.getElementById(fieldName);
    field.setCustomValidity("");    
}

function checkLogin() {
    console.log("Called checkLogin()");
    var email = document.getElementById("email1").value;
    var password = document.getElementById("password1").value;

    var xhttp = new XMLHttpRequest();
    var signInObject = null; 
    xhttp.open("POST", "/sign_in", true);
    xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhttp.send("email=" + email +
               "&password=" + password);

    xhttp.onreadystatechange = function() {
        // Waiting for request to finish, 4 when response is ready.
        if (xhttp.readyState == 4 && xhttp.status == 200) {
            signInObject = JSON.parse(xhttp.responseText);
            if(!signInObject.success) {
                var email1 = document.getElementById("email1");
                email1.setCustomValidity("User doesn't exist!");
            } else {
                //Save the token in the browser...
                sessionStorage.token = signInObject.data;
                // Initiate socket connection here...
		tsocket = new TwiddlerSocket(email, sessionStorage.token);
                console.log("Now waiting for socket response...");
		/*The current view after this should be the home view */
		currentView = showHome;
                displayView();
            }
        }
    };

    return false;
}

function logout() {
    console.log("logout() called");
    xhttp = new XMLHttpRequest();
    xhttp.open("POST", "/sign_out", true);
    xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhttp.send("token=" + sessionStorage.token); 

    xhttp.onreadystatechange = function() {
        // Waiting for request to finish, 4 when response is ready.
        if (xhttp.readyState == 4 && xhttp.status == 200) {
	    sessionStorage.removeItem("token");
        tsocket.close();
	    displayView();
	}
    };
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
	recipient = currentlyViewing;
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

    var form = new FormData();
    form.append("token", sessionStorage.token);
    form.append("message", messageContent.value);
    form.append("email", recipient);
    if (mediaObject.length != 0)
        form.append("media", mediaObject.files[0]);

    xhttp = new XMLHttpRequest();
    xhttp.open("POST", "/post_message", true);
    xhttp.send(form);

    xhttp.onreadystatechange = function() {
        if (xhttp.readyState == 4 && xhttp.status == 200) {
            messageContent.value = "";
            reloadMessages();
        }
    };

}

function changePassword() {
    console.log("Called changePassword()");
    xhttp = new XMLHttpRequest();
    xhttp.open("POST", "/change_password", true);
    xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhttp.send("oldPassword=" + document.getElementById("oldPassword").value  + "&newPassword=" 
	       +  document.getElementById("newPassword").value + "&token=" + sessionStorage.token ); 
    
    xhttp.onreadystatechange = function() {
	if (xhttp.readyState == 4 && xhttp.status == 200) {
	    messageData = JSON.parse(xhttp.responseText);
	    if (messageData.success) {
		document.getElementById("changePasswordForm").reset();
	    }
	}
    };
    return false;
} 

window.onload = function() {
    tsocket = new TwiddlerSocket(null, sessionStorage.token);
    initPages();
    displayView();
};
