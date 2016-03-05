wizardSpeech = [
    "You can post messages by clicking the post button!",
    "You can drag messages to the chat box to copy them!",
    "You can see what others have written by using browse!",
    "Hello! You can change your password by going to the account panel!",
    "Did you know that in the account panel you can see useful statistics? Aw yea!",
    "Everything has its beauty but not everyone sees it.",
    "I hear and I forget. I see and I remember. I do and I understand.",
    "Respect yourself and others will respect you.",
    "To be able under all circumstances to practice five things constitutes perfect virtue; these five things are gravity, generosity of soul, sincerity, earnestness and kindness."
];

function wizardSays() {
    var speech = Math.floor((Math.random() * wizardSpeech.length));
    alert('Twiddler Wizard: "' + wizardSpeech[speech] + '"');
}
