 displayView = function() {
   document.getElementById("content").innerHTML = document.getElementById("welcomeView").text;
};


validatePassword = function() {
    // var password = document.getElementById("password2").InnerHTML.formSize
    // alert(password)
    // var repeatedPassword = document.getElementById("repeatPsw").InnerHTML.formSize
    // if(password != null && enteredPassword != null){
    // 	alert("yea baby");
    // }
    alert("Hoochy mumma");
}

window.onload = function() {
    displayView();
    document.getElementById("signUp").onclick = function() {validatePassword()};
};
