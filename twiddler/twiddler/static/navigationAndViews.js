/* This file is related to views and navigation 
 * 
 */


/*This page initilizes the page library, the functions can
 then be used , I have not decided yet what the wildcard should do*/
initPages = function() {
    page("/Welcome", function(){
	console.log("/welcome in initPages called");
	showWelcome();
    });

    page("/Home", function() {
	console.log("/home in initPages called");
	showHome();
    });
    
    page("/Account", function() {
	console.log("/account in initPages called");
	showAccount();
    });

    page("/Browse", function() {
	console.log("/browse in initPages called");
	showBrowse(false);
    });

     page("*", function() {
	 console.log("I dont know man, wildcard baby");
     });

    page.start();
};


/*This function saves the states and then redirects the user. */
function saveStateAndRedirect(action){ 
    console.log("Called save state and redirect with action:" + action);
    var stateObj = null;
    name = null;
    switch(action) {
    case "Welcome":
	page.redirect("/Welcome");
	stateObj = {name:"Welcome"};
	name = "Welcome";
	break;
    case "Home":
	page.redirect("/Home");
	stateObj = {name:"Welcome"};
	name = "Home";
	break;
    case "Account":
	page.redirect("/Account");
	stateObj = {name:"Account"};
	name = "Account";
	break;
    case "Browse": 
	page.redirect("/Browse");
	stateObj = {name:"Browse"};
	name = "Browse";
	break;
    default:
	page.redirect("/Welcome");
	stateObj = {name:"Welcome"};
	name = "Welcome";
	break;
    }
    history.pushState(stateObj,name,name);
};

function showWelcome() {
    console.log("Called show welcome");
    currentView = showWelcome; 
    document.getElementById("content").innerHTML = document.getElementById("welcomeView").text;
}

function showHome() {
    console.log("Called showHome()");
    currentView = showHome;
    document.getElementById("content").innerHTML = document.getElementById("profileView").text;
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

function browseUsers(reload){
    console.log("Browse called");
    var email = null;
    if (reload) email = currentlyViewing;
    else email = document.getElementById("email3").value;
    var userData = null;
    var xhttp = new XMLHttpRequest();

    if(email === "") {
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
		currentlyViewing = document.getElementById("email3").value;
		initHome(userData);
	    }
        }
    };

    return false;
}

/* 
* Fetches the data from the home panel and show it on the home tab.
*/
function showBrowse(reload) {
    console.log("Called showBrowse()");
    currentView = showBrowse;
    document.getElementById("homePanel").style.display = "block";
    document.getElementById("chatPanel").style.display = "block";
    document.getElementById("chatBoxPanel").style.display = "block";
    document.getElementById("accountPanel").style.display = "none";
    document.getElementById("browsePanel").style.display = "block";
    browseUsers(reload);
}
