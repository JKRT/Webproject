function dragStart(event) {
    console.log("Post is being dragged...");
    event.dataTransfer.setData("post", event.target.innerHTML);
    console.log("The following data is being copied: ");
    console.log(event.target.innerHTML);
}

function dragDrop(event) {
    event.preventDefault();
    var data = event.dataTransfer.getData("post");
    console.log("Post begin dropped: " + data);
     event.target.value = data;
    console.log(event.target);
}

function dragOver(event) {
    event.preventDefault();
}
