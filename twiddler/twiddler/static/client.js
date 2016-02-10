/*
  Displaying the current view, the default is the home view but the value 
   of this function will change in the show* functions */
currentView = showHome;
 
displayView = function() {
    console.log("Display view called");
    if(sessionStorage.token)  {
        document.getElementById("content").innerHTML = document.getElementById("profileView").text;
        currentView();
    } else {
        console.log("trying to fetch welcome view");
        document.getElementById("content").innerHTML = document.getElementById("welcomeView").text;
    }
};

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
                displayView();
            }
        }
    };

    return false;
}

function showHome() {
    console.log("Called showHome()");
    currentView = showHome;
    document.getElementById("homePanel").style.display = "block";
    document.getElementById("chatPanel").style.display = "block";
    document.getElementById("chatBoxPanel").style.display = "block";
    document.getElementById("accountPanel").style.display = "none";
    document.getElementById("browsePanel").style.display = "none";

    var userData = null;
    var xhttp = new XMLHttpRequest();
    xhttp.open("GET", "/get_user_data_by_token?t=" + Math.random() + "&token=" + sessionStorage.token, true);
    xhttp.send(); // Data is provided in the actual URL (since we are doing a GET request).
    // Reasoning to add 't' in the url with a random value is that the brower might cache the page,
    // which is unreasonable since the provided data is dynamic and can't really be cached.

    xhttp.onreadystatechange = function() {
        // Waiting for request to finish, 4 when response is ready.
        if (xhttp.readyState == 4 && xhttp.status == 200) {
            userData = JSON.parse(xhttp.responseText);
            initHome(userData);
        }
    };
}


function initHome(userData) {
    console.log("called initHome");
    function writeToHome ( ElementById , hpDataMember, desc){
        document.getElementById( ElementById ).innerHTML = "<strong>" + desc + "</strong>" + hpDataMember;
    }
    writeToHome("homeEmail" , userData.data.email, "E-mail: ");
    writeToHome("homeFirstName" , userData.data.firstname, "First name: ");
    writeToHome("homeFamilyName" , userData.data.familyname, "Family name: ");
    writeToHome("homeGender" ,  userData.data.gender, "Gender: ");
    writeToHome("homeCity" , userData.data.city, "City: ");
    writeToHome("homeCountry" ,  userData.data.country, "Country: ");


    var messageData = null;
    var xhttp = new XMLHttpRequest();
    xhttp.open("GET", "/get_user_messages_by_email?t=" + Math.random() +
                      "&token=" + sessionStorage.token +
                      "&email=" + userData.data.email, true);
    xhttp.send(); // Data is provided in the actual URL (since we are doing a GET request).
    // Reasoning to add 't' in the url with a random value is that the brower might cache the page,
    // which is unreasonable since the provided data is dynamic and can't really be cached.

    xhttp.onreadystatechange = function() {
        // Waiting for request to finish, 4 when response is ready.
        if (xhttp.readyState == 4 && xhttp.status == 200) {
            messageData = JSON.parse(xhttp.responseText);
            var chatLog = "";
            for (var message of messageData.data) {
                chatLog += "<strong>" + message.writer + "</strong>: " + message.content + "<br>";
            }
            document.getElementById("chatPanel").innerHTML = chatLog;
        }
    };
}


function showAccount() {
    console.log("Called showAccount()");
    currentView = showAccount;
    document.getElementById("accountPanel").style.display = "block";
    document.getElementById("homePanel").style.display = "none";
    document.getElementById("chatPanel").style.display = "none";
    document.getElementById("chatBoxPanel").style.display = "none";
    document.getElementById("browsePanel").style.display = "none";
}

/* 
* Fetches the data from the home panel and show it on the home tab.
*/
function showBrowse() {
    console.log("Called showBrowse()");
    currentView = showBrowse;
    document.getElementById("homePanel").style.display = "block";
    document.getElementById("chatPanel").style.display = "block";
    document.getElementById("chatBoxPanel").style.display = "block";
    document.getElementById("accountPanel").style.display = "none";
    document.getElementById("browsePanel").style.display = "block"
    browseUsers();
}

function browseUsers(){
    console.log("Browse called");
    var email = document.getElementById("email3").value;
    var userData = null;
    var xhttp = new XMLHttpRequest();

    if(email === ""){
        return false;
    }

    /* Data is provided in the actual URL (since we are doing a GET request).
     *   Reasoning to add 't' in the url with a random value is that the brower might cache the page,
     *    which is unreasonable since the provided data is dynamic and can't really be cached.
     */
    xhttp.open("GET", "/get_user_data_by_email?t=" + 
	       Math.random() +
               "&token=" + sessionStorage.token +
               "&email=" + email, true);
    xhttp.send(); 

    xhttp.onreadystatechange = function() {
        // Waiting for request to finish, 4 when response is ready.
        if (xhttp.readyState == 4 && xhttp.status == 200) {
            userData = JSON.parse(xhttp.responseText);
	    if(!userData.success){
		var email3 = document.getElementById("email3");
                email3.setCustomValidity("User doesn't exist!");
	    } else {		
		initHome(userData);
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
	    displayView();
	}
    };
} 


function reloadMessages () {
    //Observe that the context can only be in browser or home panel mode
    currentView();
}
/* Handles message posting , if browse is activated we will fetch the email corresponding to
* to the users that we are currently viewing. */
function postMessage() {
    console.log("postMessage() called");
    if(currentView === showBrowse ) {
        var recipient = document.getElementById("email3").value;
	var messageContent = document.getElementById("chatBox");
    }

    xhttp = new XMLHttpRequest();
    xhttp.open("POST", "/post_message", true);
    xhttp.send("token=" + sessionStorage.token + "&message=" 
	       + messageContent.value + "&email=" + recipient ); 

    xhttp.onreadystatechange = function() {
        // Waiting for request to finish, 4 when response is ready.
	if (xhttp.readyState == 4 && xhttp.status == 200) {
	    messageContent.value = "";
	    reloadMessages();
	}
    };

}

function changePassword() {
    console.log("Called changePassword()");
    if(serverstub.changePassword(sessionStorage.token,
            document.getElementById("oldPassword").value,
            document.getElementById("newPassword").value).success) {
        document.getElementById("changePasswordForm").reset();
    }
    return false;
}

window.onload = function() {
    displayView();
};
