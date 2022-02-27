document.getElementById("clear_button").disabled = true;
document.getElementById("colorize_button").disabled = true;
document.getElementById("download_button").disabled = true;

const canvas = document.getElementById("input_image_canvas");
const ctx = canvas.getContext('2d');

const output_canvas = document.getElementById("output_image_canvas"); // Create canvas object for output image
const output_ctx = output_canvas.getContext("2d");

var myImage = new Image(); // Create image object
var image_width, image_height; //Create variables to store uploaded image dimensions
var originalImageDataURL; // to store original image to DataURL


let imgInput = document.getElementById("imageInput");
imgInput.addEventListener('change', function(e){
	if(e.target.files){
		ctx.clearRect(0, 0, output_canvas.width, output_canvas.height); // Clear output canvas


		let imageFile = e.target.files[0]; //here we get the image file
		var reader = new FileReader();
		reader.readAsDataURL(imageFile);
		reader.onloadend = function (e) {
			
			myImage.src = e.target.result; // Assigns converted image
			myImage.onload = function (ev) {
				image_width = myImage.width;
				image_height = myImage.height;

				output_canvas.width = image_width;
				output_canvas.height = image_height;
				
				canvas.width = image_width; // Change canvas width as per uploaded image width
				canvas.height = image_height; // Change canvas height as per uploaded image height
				ctx.drawImage(myImage, 0,0);
				document.getElementById("clear_button").disabled = false;
				document.getElementById("colorize_button").disabled = false;
				originalImageDataURL = canvas.toDataURL(); //
			}
		}
	}
})



//
window.addEventListener('load', ()=>{
	document.addEventListener('mousedown', startPainting);
	document.addEventListener('mouseup', stopPainting);
	document.addEventListener('mousemove', sketch);
});

// Clear canvas
function clear_canvas(){
	ctx.drawImage(myImage, 0,0);
}

// Colorize image
function colorize_image() {
	
	var imgData = ctx.getImageData(0,0, image_width, image_height);
	output_ctx.putImageData(imgData, 0,0);

	var imageDataURL = output_canvas.toDataURL(); // Convert canvas image data to DataURL
	$.ajax({
		console.log('Here we send request');
		type: "POST",
		url: "/hook",
		data: {
			'originalImageDataURL' : originalImageDataURL,
			'markedImageDataURL': imageDataURL
		},
		success: function(response){
			alert('Colorization done !!!');
			var resultImage = new Image();
			resultImage.onload = function() {
			  output_ctx.drawImage(resultImage, 0, 0);
			};
			resultImage.src="data:image/bmp;base64,"+ response['img_data'];
			document.getElementById("download_button").disabled = false;
			clear_canvas();
		},
		error:function(error){
			console.log(error);
		}
	});
}


let coord = {x:0 , y:0}; // Stores the initial position of the cursor
let paint = false; // This is the flag that we are going to use to trigger drawing		

// Updates the coordianates of the cursor when an event e is triggered to the coordinates wherethe said event is triggered.
function getPosition(event){
	coord.x = event.clientX - canvas.offsetLeft;
	coord.y = event.clientY - canvas.offsetTop;
}

// The following functions toggle the flag to start and stop drawing
function startPainting(event){
	paint = true;
	getPosition(event);
}

function stopPainting(){
	paint = false;
}

function sketch(event){
	if (!paint) return;
	ctx.beginPath();	
	ctx.lineWidth = 5; // Sets the width of line
	ctx.lineCap = 'round'; // Sets the end of the lines drawn to a round shape.
	ctx.strokeStyle = document.getElementById('favcolor').value;//'green'; // Sets the color 
	ctx.moveTo(coord.x, coord.y); // The cursor to start drawing moves to this coordinate
	getPosition(event); // The position of the cursor gets updated as we move the mouse around.
	ctx.lineTo(coord.x , coord.y); // A line is traced from start coordinate to this coordinate
	ctx.stroke(); // Draws the line.
}

function download_image() {
  var image = output_canvas.toDataURL("image/bmp", 1.0).replace("image/bmp", "image/octet-stream");
  var link = document.createElement('a');
  link.download = "result_color.bmp";
  link.href = image;
  link.click();
}
