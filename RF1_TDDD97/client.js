 displayView = function() {
   document.getElementById("content").innerHTML = document.getElementById("welcomeView").text;
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
      alert(signInObject.data);
      return true;
    }

}


window.onload = function() {
    displayView();
   document.getElementById("signUpForm").onsubmit = function() {return checkSignUp()}; 
   document.getElementById("loginForm").onsubmit = function() {return checkLogin()}; 

};
