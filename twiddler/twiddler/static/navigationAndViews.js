/* This file is related to views and navigation 
 * 
 */

function displayView() {
    console.log("Display view called");
    if(sessionStorage.token)  {
	console.log("Trying to fetch the home view");
	switch(currentView.name) {
	case "showHome":
	    saveStateAndRedirect("Home");
	    break;
	case "showAccount": 
	    saveStateAndRedirect("Account");
	    break;
	case "showBrowse":
	    saveStateAndRedirect("Browse");
	    break;
	}
    } else {
        console.log("trying to fetch welcome view");
	saveStateAndRedirect("Welcome");
    }
};

/*This page initilizes the page library, the functions can
 then be used , I have not decided yet what the wildcard should do*/

initPages = function() {
    this.refresh = true;
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
	showBrowse(refresh);
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
    sessionStorage.currentlyViewing = ""
	name = "Welcome";
	break;
    case "Home":
	page.redirect("/Home");
	stateObj = {name:"Home"};
    sessionStorage.currentlyViewing = ""
	name = "Home";
	break;
    case "Account":
	page.redirect("/Account");
	stateObj = {name:"Account"};
    sessionStorage.currentlyViewing = ""
	name = "Account";
	break;
    case "Browse": 
    initPages.refresh = false;
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
    var message = {
        "email": sessionStorage.email
    };

    var request = new TwiddlerRequest("GET", "/get_user_data_by_token",
                                      message, showHomeHandler);
    request.send(); // Data is provided in the actual URL (since we are doing a GET request).
    // Reasoning to add 't' in the url with a random value is that the brower might cache the page,
    // which is unreasonable since the provided data is dynamic and can't really be cached.
}

function showHomeHandler(response) {
    var userData = JSON.parse(response);
    initHome(userData);
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

    var message = {
        "email": userData.data.email,
        "semail": sessionStorage.email
    };

    var request = new TwiddlerRequest("GET", "/get_user_messages_by_email",
                                      message, initHomeHandler);
    request.send(); // Data is provided in the actual URL (since we are doing a GET request).
    // Reasoning to add 't' in the url with a random value is that the brower might cache the page,
    // which is unreasonable since the provided data is dynamic and can't really be cached.
}

function initHomeHandler(response) {
    var messageData = JSON.parse(response);
    var chatLog = "";
    for (var message of messageData.data) {
        chatLog += "<strong>" + message.writer + "</strong>: " + message.content + "<br>";
    }

    document.getElementById("chatPanel").innerHTML = chatLog;
}

function showAccount() {
    console.log("Called showAccount()");
    currentView = showAccount;
    document.getElementById("content").innerHTML = document.getElementById("profileView").text;
    document.getElementById("accountPanel").style.display = "block";
    document.getElementById("homePanel").style.display = "none";
    document.getElementById("chatPanel").style.display = "none";
    document.getElementById("chatBoxPanel").style.display = "none";
    document.getElementById("browsePanel").style.display = "none";
}

function browseUsers(reload){
    console.log("browseUsers called");
    var email = null;
    if (reload)
        email = sessionStorage.currentlyViewing;
    else {
        email = document.getElementById("email3").value;
        sessionStorage.currentlyViewing = email;
    }

    var message = {
        "email": email,
        "semail": sessionStorage.email
    };

    /* Data is provided in the actual URL (since we are doing a GET request).
     *   Reasoning to add 't' in the url with a random value is that the brower might cache the page,
     *    which is unreasonable since the provided data is dynamic and can't really be cached.
     */

    if (email === "") return false;
    var request = new TwiddlerRequest("GET", "/get_user_data_by_email",
                                      message, browseUsersHandler);
    request.send();
    return false;
}

function browseUsersHandler(response) {
    var userData = JSON.parse(response);
    if(!userData.success){
        var email3 = document.getElementById("email3");
        email3.setCustomValidity("User doesn't exist!");
    } else {
        // sessionStorage.currentlyViewing = document.getElementById("email3").value;
        initHome(userData);
    }
}

/* 
* Fetches the data from the home panel and show it on the home tab.
*/
function showBrowse(reload) {
    console.log("Called showBrowse()");
    currentView = showBrowse;
    document.getElementById("content").innerHTML = document.getElementById("profileView").text;
    document.getElementById("homePanel").style.display = "block";
    document.getElementById("chatPanel").style.display = "block";
    document.getElementById("chatBoxPanel").style.display = "block";
    document.getElementById("accountPanel").style.display = "none";
    document.getElementById("browsePanel").style.display = "block";
    document.getElementById("email3").value = sessionStorage.currentlyViewing;
    browseUsers(reload);
}
