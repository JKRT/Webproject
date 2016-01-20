 displayView = function() {
   document.getElementById("content").innerHTML = document.getElementById("welcomeView").text;
};


validPasswd = function (password, required_password) {
 alert("HELLO BABY");
}

window.onload = function() {

    var password = document.getElementById("password");
    var repeatPsw = document.getElementById("repeatPsw");

    password.onchange = validPasswd(document.getElementById("password"),document.getElementById("repeatPsw"));
    repeatPsw.onkeyup = (validPasswd (document.getElementById("password"),document.getElementById("repeatPsw")));
};
