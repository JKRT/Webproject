/* When the selected post is dragged, the
 * data contained within is set via the dataTransfer
 * function. This will be user in the below events. */

function dragStart(event) {
    console.log("Post is being dragged...");
    event.dataTransfer.setData("post", event.target.innerHTML);
    console.log("The following data is being copied: ");
    console.log(event.target.innerHTML);
}

/* When the data above is dragged to the correct
 * container (the chatbox) the data is retrieved
 * and then inserted into the container. */

function dragDrop(event) {
    event.preventDefault();
    var data = event.dataTransfer.getData("post");
    console.log("Post begin dropped: " + data);
    event.target.value = data;
    console.log(event.target);
}

/* Seinfeldt är ett väldigt bra TV program! */

function dragOver(event) {
    event.preventDefault();
}
