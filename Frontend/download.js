import domtoimage from "dom-to-image"

domtoimage.toBlob(document.getElementById("my-node")).then(function (blob) {
    window.saveAs(blob, "my-node.png")
})
