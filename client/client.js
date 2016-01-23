displayView = function() {
    console.log("Display view called");
    if(sessionStorage.token)  {
	document.getElementById("content").innerHTML = document.getElementById("profileView").text;
    } else { 
	console.log("trying to fetch welcome view");
	document.getElementById("content").innerHTML = document.getElementById("welcomeView").text;
    }
};


checkSignUp = function() {
    var password = document.getElementById("password2").value;
    var enteredPassword  = document.getElementById("repeatPsw").value ;


    var dataObject = {email: document.getElementById("email2").value,
                      password: document.getElementById("password2").value,
                      firstname: document.getElementById("firstName").value,
                      familyname: document.getElementById("familyName").value,
                      gender: document.getElementById("gender").value,
                      city: document.getElementById("city").value,
                      country: document.getElementById("country").value};

    if( password === enteredPassword ) {
        var signUpObject = serverstub.signUp(dataObject);
        if (!signUpObject.success) {
            alert(signUpObject.message);
            return false;
        }

        return true;
    }

    return false;
}

checkLogin = function() {
    var email = document.getElementById("email1").value;
    var password = document.getElementById("password1").value;
    var signInObject = serverstub.signIn(email,password);

    if(!signInObject.success) {
        alert(signInObject.message);
        return false;
    } else {
	//Save the token in the browser...
	sessionStorage.token = signInObject.data;
	return true;
    }

}

showHome = function() {
    document.getElementById("homePanel").style.display = "block";
    document.getElementById("chatPanel").style.display = "block";
    document.getElementById("lowerLogoSloganPanel").style.display = "block";
    document.getElementById("accountPanel").style.display = "none";
    var homePanelObject = serverstub.getUserDataByToken(sessionStorage.token);
    document.getElementById("homeEmail").innerHTML = homePanelObject.data.email;
    document.getElementById("homeFirstName").innerHTML = homePanelObject.data.firstname;
    document.getElementById("homeFamilyName").innerHTML = homePanelObject.data.familyname;
    document.getElementById("homeGender").innerHTML = homePanelObject.data.gender;
    document.getElementById("homeCity").innerHTML = homePanelObject.data.city;
    document.getElementById("homeCountry").innerHTML = homePanelObject.data.country;
    var chatLog = "";
    for (var message of serverstub.getUserMessagesByToken(sessionStorage.token).data) {
	chatLog += "<strong>" + message.writer + "</strong>: " + message.content + "<br>";
    } 

    document.getElementById("chatPanel").innerHTML = chatLog;
}

showAccount = function() {
    document.getElementById("accountPanel").style.display = "block";
    document.getElementById("homePanel").style.display = "none";
    document.getElementById("chatPanel").style.display = "none";
    document.getElementById("lowerLogoSloganPanel").style.display = "none";
}

logout = function() {
    console.log("logoutFunctionCalled");
    alert(serverstub.signOut(sessionStorage.token).message);
    sessionStorage.removeItem("token");
    displayView();
}

reloadMessages = function() {
    showHome();
}

postMessage = function(recipient) {
    var messageContent = document.getElementById("chatBox");
    alert(serverstub.postMessage(sessionStorage.token, messageContent.value, recipient).message);
    messageContent.value = "";
    reloadMessages();
}

postMessageToSelf = function() {
    var homePanelObject = serverstub.getUserDataByToken(sessionStorage.token);
    postMessage(homePanelObject.data.email);
}


changePassword = function() {
    console.log("Called changePassword()");
    alert(serverstub.changePassword(sessionStorage.token, 
				    document.getElementById("oldPassword").value,
				    document.getElementById("newPassword").value).message);
}

window.onload = function() {
    displayView();
    if (!sessionStorage.token) {
	document.getElementById("signUpForm").onsubmit = function() {return checkSignUp()}; 
	document.getElementById("loginForm").onsubmit = function() {return checkLogin()}; 
    } else {
	showHome();
	document.getElementById("changePasswordForm").onsubmit = function() {return changePassword()}; 
    }
};
