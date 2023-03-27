// Select the input file element
const fileInput = document.querySelector('#file-input');
// global variable to preserve original image data
var originalData;
var selectedEffect = 'blur';
// global varibles for selected coordinates of image using imgareaselect
var x1, y1, x2, y2, width, height;
// selecting the image canvas
var canvas = document.getElementById('image-canvas');
var ctx = canvas.getContext("2d");
const effectsDropdown = document.querySelector('#effects');
const sizeSlider = document.querySelector('#size-slider');
const radiusSlider = document.querySelector('#radius-slider');

effectsDropdown.addEventListener('change', (event) => {
  if (event.target.value === 'blur') {
    radiusSlider.style.display = 'block';
    sizeSlider.style.display = 'none';
    selectedEffect = 'blur';
    blur();
  } 
  else {
    sizeSlider.style.display = 'block';
    radiusSlider.style.display = 'none';
    selectedEffect = 'pixelate';
    pixelate();
  } 
});

radiusSlider.addEventListener('change', (event) => {
  document.getElementById('blur-radius').value = event.target.value;
  blur();
});


// onchage event on loading of a file which will draw image and canvas for
// original image
$('#file-input').change(function () {
  var file = this.files[0];
  var image = new Image();

  // Load the image into the canvas and resize it
  var reader = new FileReader();
  reader.onload = function (event) {
    image.src = event.target.result;
    image.onload = function () {
      let width, height;
      if (image.width > image.height) {
        const widthRatio = 900 / image.width;
        width = 900;
        height = image.height * widthRatio;
        if (height > 500) {
          const heightRatio = 500 / height;
          height = 500;
          width = width * heightRatio;
        }
      } else {
        const heightRatio = 500 / image.height;
        height = 500;
        width = image.width * heightRatio;
        if (width > 900) {
          const widthRatio = 900 / width;
          width = 900;
          height = height * widthRatio;
        }
      }
      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(image, 0, 0, width, height);
      originalData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const initImgAreaSelect = function () {
        $('#image-canvas').imgAreaSelect({
          x1: 0,
          y1: 0,
          x2: 100,
          y2: 100,
          handles: true,
          onSelectEnd: function (img, selection) {
            selectedArea = selection; // set the global variable
            setTimeout(function () {
              // use selectedArea after a delay of 1 second
              if (selectedArea !== null) {
                x1 = parseInt(selectedArea.x1);
                y1 = parseInt(selectedArea.y1);
                x2 = parseInt(selectedArea.x2);
                y2 = parseInt(selectedArea.y2);
                width = selectedArea.width;
                height = selectedArea.height;
                console.log(x1, y1, width, height);
                // perform further processing
                  if (selectedEffect == "blur") blur();
                  else pixelate();
              }
            }, 1000);
          }
        });
      };
      if (canvas.width && canvas.height) {
        console.log("canvas is complete");
        initImgAreaSelect();
      }

    };
  };
  reader.readAsDataURL(file);
});



function pixelate() {
  ctx.putImageData(originalData, 0, 0);
  width = x2 - x1;
  height = y2 - y1;
  let pixelSize = document.getElementById("pixel-size").value;
  pixelSize = parseInt(pixelSize);
  var imageData = ctx.getImageData(x1, y1, width, height);
  for (var y = 0; y < height; y += pixelSize) {
    for (var x = 0; x < width; x += pixelSize) {
      var pixelIndex = (y * width + x) * 4;
      var red = imageData.data[pixelIndex];
      var green = imageData.data[pixelIndex + 1];
      var blue = imageData.data[pixelIndex + 2];
      for (var i = 0; i < pixelSize; i++) {
        for (var j = 0; j < pixelSize; j++) {
          var pixelIndex2 = ((y + i) * width + (x + j)) * 4;
          imageData.data[pixelIndex2] = red;
          imageData.data[pixelIndex2 + 1] = green;
          imageData.data[pixelIndex2 + 2] = blue;
        }
      }
    }
  }
  ctx.putImageData(imageData, x1, y1);

  console.log("pixelated");
}


// function to blur canvas using stackblur
// Listen for clicks on the blur rectangle button
function blur() {
  console.log('blured');
  ctx.putImageData(originalData, 0, 0);
  let blurRadius = document.getElementById('blur-radius').value;
  StackBlur.canvasRGBA(canvas, x1, y1, x2 - x1, y2 - y1, blurRadius);
}



//add eventListner to JPG download button
// add event listener to button
document.getElementById("imageJPG").addEventListener("click", function () {

  if (canvas.height && canvas.width) {
    // get the canvas data as a JPG image
    let imageData = canvas.toDataURL("image/jpeg");

    // create a link element and set its download attribute
    const link = document.createElement("a");
    link.download = "image.jpg";

    // set the href attribute to the canvas data
    link.href = imageData;

    // add the link to the document and simulate a click
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
});


//add eventListner to PNG download button
// add event listener to button
document.getElementById("imagePNG").addEventListener("click", function () {
  // get the canvas data as a JPG image
  if (canvas.height && canvas.width) {
    let imageData = canvas.toDataURL("image/png");

    // create a link element and set its download attribute
    const link = document.createElement("a");
    link.download = "image.png";

    // set the href attribute to the canvas data
    link.href = imageData;

    // add the link to the document and simulate a click
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
});
