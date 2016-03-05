function dragStart(event) {
    console.log("Post is being dragged...");
    event.dataTransfer.setData("post", event.target.innerHTML);
    console.log("The following data is being copied: ");
    console.log(event.target.innerHTML);
}

function dragDrop(event) {
    event.preventDefault();
    var data = event.dataTransfer.getData("post");
    event.target.innerHTML = data;
}

function dragOver(event) {
    event.preventDefault();
}
