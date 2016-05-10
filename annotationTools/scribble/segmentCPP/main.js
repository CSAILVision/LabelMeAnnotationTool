// Module.TOTAL_MEMORY = 40000000;

grabCut = Module.cwrap(
    'grabCut', 'number', ['number', 'number', 'number', 'number']
);

var scribbleMode = false;
var mousePosition = {i: 0, j: 0};
// var bins = 10;
var numImages = 22

$(document).ready(function() {
    $('#scribbleCanvas').mousedown(mouseDownCallback);
    $('#scribbleCanvas').mousemove(mouseMoveCallback);
    $('#scribbleCanvas').mouseup(mouseUpCallback);
    $('#compute').click(compute);
    $('input[name=mode]').click(hideButton);
    var imgNumber = Math.floor(numImages * Math.random()) + 1;
    // var imgNumber = 1;
    drawImageToCanvas('images/' + imgNumber + '.jpg');
    // drawImageToCanvas('coins.jpg')
})

function drawImageToCanvas(url) {
    var img = new Image();
    img.src = url;
    img.onload = function() {
        resizeCanvas(img)
        var context = $('#imageCanvas')[0].getContext('2d');
        context.drawImage(img, 0, 0, img.width, img.height);
        compute();
    }
}


function compute() {
    var imageData = getImageData('imageCanvas');
    var scribbleData = getImageData('scribbleCanvas');

    var size = imageData.data.length * imageData.data.BYTES_PER_ELEMENT;
    var imagePtr = Module._malloc(size);
    var scribblePtr = Module._malloc(size);

    // Copy data to Emscripten heap (directly accessed from Module.HEAPU8)

    var imageHeap = new Uint8Array(Module.HEAPU8.buffer, imagePtr, size);
    imageHeap.set(new Uint8Array(imageData.data.buffer));

    var scribbleHeap = new Uint8Array(Module.HEAPU8.buffer, scribblePtr, size);
    scribbleHeap.set(new Uint8Array(scribbleData.data.buffer));

    // Call function and get result

    var flow = grabCut(imageHeap.byteOffset, scribbleHeap.byteOffset, imageData.height, imageData.width);

    console.log('Flow(js):', flow);

    var resultData = new Uint8ClampedArray(imageHeap.buffer, imageHeap.byteOffset, imageData.data.length);
    // var resultData = new ImageData(resultData, imageData.width, imageData.height);
    var context = $('#resultCanvas')[0].getContext('2d');
    var resultImageData = context.createImageData(imageData.width, imageData.height);
    resultImageData.data.set(resultData);


    // Free memory
    Module._free(imageHeap.byteOffset);
    Module._free(scribbleHeap.byteOffset);

    drawResult(resultImageData);
}

function mouseDownCallback(e) {
    scribbleMode = true;
    var offsetX = $(this).position().left;
    var offsetY = $(this).position().top;
    mousePosition.i = Math.round(e.pageY - offsetY);
    mousePosition.j = Math.round(e.pageX - offsetX);
}

function mouseMoveCallback(e) {
    var offsetX = $(this).position().left;
    var offsetY = $(this).position().top;
    if (scribbleMode) {
        var i = Math.round(e.pageY - offsetY);
        var j = Math.round(e.pageX - offsetX);
        var context = $('#scribbleCanvas')[0].getContext('2d');
        context.beginPath()
        context.moveTo(mousePosition.j, mousePosition.i);
        context.lineTo(j, i);
        context.lineWidth = 3;
        var segment = $('input:radio[name=segment]:checked').val()
        if (segment == 'foreground') {
            context.strokeStyle = '#ff0000';
        } else {
            context.strokeStyle = '#00ff00';
        }
        context.stroke();
        mousePosition.i = i;
        mousePosition.j = j;
    }
}

function mouseUpCallback(e) {
    scribbleMode = false;
    // var scribbleData = getImageData('scribbleCanvas');
    var mode = $('input:radio[name=mode]:checked').val()
    if (mode == 'automatic') {
        compute();
    }
}

function resizeCanvas(image) {
    var canvases = $('canvas');
    for (var i = 0; i < canvases.length; i++) {
        canvases[i].height = image.height;
        canvases[i].width = image.width;
    }

    // move the scribbleCanvas on top of the imageCanvas
    var scribbleOffset = $('#scribbleCanvas').position()['left'];
    var imageOffset = $('#imageCanvas').position()['left'];
    $('#scribbleCanvas').css('left', imageOffset - scribbleOffset);
}

function getImageData(canvasName) {
    var canvas = $('#' + canvasName)[0]
    var context = canvas.getContext('2d');
    return context.getImageData(0, 0, canvas.width, canvas.height);
}

function drawResult(resultData) {
    var context = $('#resultCanvas')[0].getContext('2d');
    context.putImageData(resultData, 0, 0);
}

function hideButton() {
    var mode = $('input:radio[name=mode]:checked').val()
    if (mode == 'automatic') {
        $('#compute').hide();
    } else {
        $('#compute').show();
    }
}
