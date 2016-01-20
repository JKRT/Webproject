 displayView = function() {
    document.getElementById("content").innerHTML = document.getElementById("welcomeView").text;
};

window.onload = function() {
    displayView();
};
