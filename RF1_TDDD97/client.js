 displayView = function() {
   document.getElementById("content").innerHTML = document.getElementById("welcomeView").text;
};


validatePassword = function() {
    var password = document.getElementById("password2").value;
    var enteredPassword  = document.getElementById("repeatPsw").value ;

    if( password === enteredPassword ) {
        return true;
    }

    return false;
}

window.onload = function() {
    displayView();
    document.getElementById("signUpForm").onsubmit = function() {return validatePassword()};
};
