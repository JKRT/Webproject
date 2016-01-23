displayView = function() {
    console.log("Display view called");
    if(sessionStorage.token)  {
        document.getElementById("content").innerHTML = document.getElementById("profileView").text;
        showHome();
    } else {
        console.log("trying to fetch welcome view");
        document.getElementById("content").innerHTML = document.getElementById("welcomeView").text;
    }
};


function checkSignUp() {
    if(document.getElementById("password2").value === document.getElementById("repeatPsw").value) {
        var dataObject = {email: document.getElementById("email2").value,
                        password: document.getElementById("password2").value,
                        firstname: document.getElementById("firstName").value,
                        familyname: document.getElementById("familyName").value,
                        gender: document.getElementById("gender").value,
                        city: document.getElementById("city").value,
                        country: document.getElementById("country").value};

        var signUpObject = serverstub.signUp(dataObject);
        if (!signUpObject.success) {
            alert(signUpObject.message);
            return false;
        }

        return true;
    }

    return false;
}

function checkLogin() {
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

function showHome() {
    document.getElementById("homePanel").style.display = "block";
    document.getElementById("chatPanel").style.display = "block";
    document.getElementById("lowerLogoSloganPanel").style.display = "block";
    document.getElementById("accountPanel").style.display = "none";

    function writeToHome ( ElementById , hpDataMember ){
	document.getElementById( ElementById ).innerHTML = hpDataMember; 
    }
    
    var homePanelObject = serverstub.getUserDataByToken(sessionStorage.token);
    writeToHome("homeEmail" , homePanelObject.data.email);
    writeToHome("homeFirstName" , homePanelObject.data.firstname); 
    writeToHome("homeFamilyName" , homePanelObject.data.familyname);
    writeToHome("homeGender" ,  homePanelObject.data.gender);
    writeToHome("homeCity" , homePanelObject.data.city);
    writeToHome("homeCountry" ,  homePanelObject.data.country);
    
    var chatLog = "";
    for (var message of serverstub.getUserMessagesByToken(sessionStorage.token).data) {
        chatLog += "<strong>" + message.writer + "</strong>: " + message.content + "<br>";
    } 

    document.getElementById("chatPanel").innerHTML = chatLog;
}

function showAccount() {
    document.getElementById("accountPanel").style.display = "block";
    document.getElementById("homePanel").style.display = "none";
    document.getElementById("chatPanel").style.display = "none";
    document.getElementById("lowerLogoSloganPanel").style.display = "none";
}

function logout() {
    console.log("logoutFunctionCalled");
    alert(serverstub.signOut(sessionStorage.token).message);
    sessionStorage.removeItem("token");
    displayView();
}

function reloadMessages () {
    showHome();
}

function postMessage(recipient) {
    var messageContent = document.getElementById("chatBox");
    alert(serverstub.postMessage(sessionStorage.token, messageContent.value, recipient).message);
    messageContent.value = "";
    reloadMessages();
}

function postMessageToSelf() {
    var homePanelObject = serverstub.getUserDataByToken(sessionStorage.token);
    postMessage(homePanelObject.data.email);
}


function changePassword() {
    console.log("Called changePassword()");
    alert(serverstub.changePassword(sessionStorage.token, 
                document.getElementById("oldPassword").value,
                document.getElementById("newPassword").value).message);
}

window.onload = function() {
    displayView();
};
