displayView = function() {
    console.log("Display view called");
    if(sessionStorage.token)  {
        document.getElementById("content").innerHTML = document.getElementById("profileView").text;
        showHome();
    } else {
        console.log("trying to fetch welcome view");
        document.getElementById("content").innerHTML = document.getElementById("welcomeView").text;
        // addCustomValidation();
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

        if (signUpObject.success) {
            var email2 = document.getElementById("email2");
            email2.setCustomValidity("");
            document.getElementById("signUpForm").reset();
        } else {
            var email2 = document.getElementById("email2");
            email2.setCustomValidity("User already exists!");
        }
    }

    return false;
}

function checkLogin() {
    var email = document.getElementById("email1").value;
    var password = document.getElementById("password1").value;
    var signInObject = serverstub.signIn(email,password);

    if(!signInObject.success) {
        console.log("Tyv'r kompis, no login")
        var email1 = document.getElementById("email1");
        email1.setCustomValidity("User doesn't exist!");
    } else {
        //Save the token in the browser...
        var email1 = document.getElementById("email1");
        email1.setCustomValidity("");
        sessionStorage.token = signInObject.data;
        displayView();
    }

    return false;
}

function showHome() {
    document.getElementById("homePanel").style.display = "block";
    document.getElementById("chatPanel").style.display = "block";
    document.getElementById("chatBoxPanel").style.display = "block";
    document.getElementById("accountPanel").style.display = "none";
    document.getElementById("browsePanel").style.display = "none";

    var userData = serverstub.getUserDataByToken(sessionStorage.token);
    initHome(userData);

    var chatLog = "";
    for (var message of serverstub.getUserMessagesByToken(sessionStorage.token).data) {
        chatLog += "<strong>" + message.writer + "</strong>: " + message.content + "<br>";
    }

    document.getElementById("chatPanel").innerHTML = chatLog;
}


function initHome(userData) {
 function writeToHome ( ElementById , hpDataMember, desc){
        document.getElementById( ElementById ).innerHTML = "<strong>" + desc + "</strong>" + hpDataMember;
    }
    writeToHome("homeEmail" , userData.data.email, "E-mail: ");
    writeToHome("homeFirstName" , userData.data.firstname, "First name: ");
    writeToHome("homeFamilyName" , userData.data.familyname, "Family name: ");
    writeToHome("homeGender" ,  userData.data.gender, "Gender: ");
    writeToHome("homeCity" , userData.data.city, "City: ");
    writeToHome("homeCountry" ,  userData.data.country, "Country: ");

}


function showAccount() {
    document.getElementById("accountPanel").style.display = "block";
    document.getElementById("homePanel").style.display = "none";
    document.getElementById("chatPanel").style.display = "none";
    document.getElementById("chatBoxPanel").style.display = "none";
    document.getElementById("browsePanel").style.display = "none";
}

function showBrowse() {
    console.log("Browse called");
    document.getElementById("homePanel").style.display = "block";
    document.getElementById("chatPanel").style.display = "block";
    document.getElementById("chatBoxPanel").style.display = "block";
    document.getElementById("accountPanel").style.display = "none";
    document.getElementById("browsePanel").style.display = "block"

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
