// script.js

const img = new Image(); // used to load image from <input> and draw to canvas

const canvas = document.getElementById('user-image');
const context = canvas.getContext('2d');
const rstBtn = document.querySelector("[type='reset']");
const readBtn = document.querySelector("[type='button']");
const sbmtBtn = document.querySelector("[type='submit'");
const imgInput = document.getElementById('image-input');
const genMeme = document.getElementById('generate-meme');
const voiceSelect = document.getElementById('voice-selection');
const volumeGroup = document.getElementById('volume-group');

// speech synth stuff
var synth = window.speechSynthesis;
var voices = [];
let volume = document.querySelector("[type='range']").value / 100;

// Fires whenever the img object loads a new image (such as with img.src =)
img.addEventListener('load', () => {

  // Some helpful tips:
  // - Fill the whole Canvas with black first to add borders on non-square images, then draw on top
  // - Clear the form when a new image is selected
  // - If you draw the image to canvas here, it will update as soon as a new image is selected

  let canvasWidth = canvas.width;
  let canvasHeight = canvas.height;
  context.clearRect(0,0,canvasWidth,canvasHeight);
  context.fillStyle = 'black';
  context.fillRect(0,0,canvasWidth,canvasHeight);
  let dimensions = getDimmensions(canvasWidth, canvasHeight, img.width, img.height);
  context.drawImage(img, dimensions.startX, dimensions.startY, dimensions.width, dimensions.height);

  // reset buttons
  rstBtn.disabled = true;
  readBtn.disabled = true;
  sbmtBtn.disabled = false;
});

// choose file
imgInput.addEventListener('change', () => {
  img.src = URL.createObjectURL(imgInput.files[0]);
  let fileName = imgInput.files[0].name;
  img.alt = fileName;
});

// generate meme
genMeme.addEventListener('submit', (evt) => {
  evt.preventDefault();
  let top = document.getElementById('text-top').value;
  let bottom = document.getElementById('text-bottom').value;
  
  context.font = 'bold 50px Impact';
  context.textAlign = 'center';
  context.fillStyle = 'white';
  context.strokeStyle = 'black';
  context.lineWidth = 0.75;
  context.fillText(top, canvas.width / 2, 50);
  context.fillText(bottom, canvas.width / 2, canvas.height - 10);
  context.strokeText(top, canvas.width / 2, 50);
  context.strokeText(bottom, canvas.width / 2, canvas.height - 10);

  sbmtBtn.disabled = true;
  rstBtn.disabled = false;
  readBtn.disabled = false;
});

// clear
rstBtn.addEventListener('click', () => {
  context.clearRect(0,0,canvas.width,canvas.height);
  sbmtBtn.disabled = false;
  rstBtn.disabled = true;
  readBtn.disabled = true;

});

// read text
readBtn.addEventListener('click', () => {
  let top = document.getElementById('text-top').value;
  let bottom = document.getElementById('text-bottom').value;
  let combined = top + ' ' + bottom;

  let say = new SpeechSynthesisUtterance(combined);
  say.voice = voices[voiceSelect.selectedOptions[0].getAttribute('voices-idx')];
  say.volume = volume;
  synth.speak(say);
});

// voices
function populateVoiceList() {
  voices = synth.getVoices();
  voiceSelect.remove(0);
  for(let i = 0; i < voices.length ; i++) {
    console.log(voices[i].name);
    let option = document.createElement('option');
    option.textContent = voices[i].name + ' (' + voices[i].lang + ')';

    if(voices[i].default) {
      option.textContent += ' -- DEFAULT';
    }

    option.setAttribute('data-lang', voices[i].lang);
    option.setAttribute('data-name', voices[i].name);
    option.setAttribute('voices-idx', i);
    voiceSelect.appendChild(option);
  }
  voiceSelect.disabled = false;
}

populateVoiceList();
if (speechSynthesis.onvoiceschanged !== undefined) {
  speechSynthesis.onvoiceschanged = populateVoiceList;
}

// volume
volumeGroup.addEventListener('input', () => {
  let intVol = document.querySelector("[type='range']").value;
  volume = intVol / 100;

  let volumeIcon = document.querySelectorAll('img')[0];
  if (intVol == 0) {
    volumeIcon.src = 'icons/volume-level-0.svg';
  } else if (intVol <= 33) {
    volumeIcon.src = 'icons/volume-level-1.svg';
  } else if (intVol <= 66) {
    volumeIcon.src = 'icons/volume-level-2.svg';
  } else {
    volumeIcon.src = 'icons/volume-level-3.svg';
  }
});

/**
 * Takes in the dimensions of the canvas and the new image, then calculates the new
 * dimensions of the image so that it fits perfectly into the Canvas and maintains aspect ratio
 * @param {number} canvasWidth Width of the canvas element to insert image into
 * @param {number} canvasHeight Height of the canvas element to insert image into
 * @param {number} imageWidth Width of the new user submitted image
 * @param {number} imageHeight Height of the new user submitted image
 * @returns {Object} An object containing four properties: The newly calculated width and height,
 * and also the starting X and starting Y coordinate to be used when you draw the new image to the
 * Canvas. These coordinates align with the top left of the image.
 */
function getDimmensions(canvasWidth, canvasHeight, imageWidth, imageHeight) {
  let aspectRatio, height, width, startX, startY;

  // Get the aspect ratio, used so the picture always fits inside the canvas
  aspectRatio = imageWidth / imageHeight;

  // If the apsect ratio is less than 1 it's a verical image
  if (aspectRatio < 1) {
    // Height is the max possible given the canvas
    height = canvasHeight;
    // Width is then proportional given the height and aspect ratio
    width = canvasHeight * aspectRatio;
    // Start the Y at the top since it's max height, but center the width
    startY = 0;
    startX = (canvasWidth - width) / 2;
    // This is for horizontal images now
  } else {
    // Width is the maximum width possible given the canvas
    width = canvasWidth;
    // Height is then proportional given the width and aspect ratio
    height = canvasWidth / aspectRatio;
    // Start the X at the very left since it's max width, but center the height
    startX = 0;
    startY = (canvasHeight - height) / 2;
  }

  return { 'width': width, 'height': height, 'startX': startX, 'startY': startY }
}