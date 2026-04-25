// Global variables defined in JSON
let shapes = [];
let bubbles = [];
let seaweeds = [];
let rocks = [];
let song;
let amplitude;
let muteBtn;
let volumeSlider;
let vibrateBtn;
let isVibrating = false;
// External definition of polygon vertices (base coordinates)
let points = [[-3, 5], [3, 7], [1, 5], [2, 4], [4, 3], [5, 2], [6, 2], [8, 4], [8, -1], [6, 0], [0, -3], [2, -6], [-2, -3], [-4, -2], [-5, -1], [-6, 1], [-6, 2]];

function preload() {
  // Load sound file and assign to global variable song
  // Make sure 'midnight-quirk-255361.mp3' exists in the project folder
  song = loadSound('midnight-quirk-255361.mp3');
}

function setup() {
  // Initialize canvas
  let cnv = createCanvas(windowWidth, windowHeight);
  cnv.mousePressed(togglePlay);

  // Initialize amplitude object
  amplitude = new p5.Amplitude();

  // Create mute button
  muteBtn = createButton('Mute');
  muteBtn.position(20, 20);
  muteBtn.mousePressed(toggleMute);

  volumeSlider = createSlider(0, 1, 0.5, 0.01);
  volumeSlider.position(80, 20);

  vibrateBtn = createButton('Vibrate: OFF');
  vibrateBtn.position(250, 20);
  vibrateBtn.mousePressed(toggleVibration);

  // Start playing the song (looping) as described in program description
  // Note: Browsers may block audio until user interaction.
  if (song.isLoaded()) {
    song.loop();
  }

  let palette = ['#bde0fe', '#ffc300', '#feeafa', '#dde5b6'];
  // Generate 10 shape objects
  for (let i = 0; i < 10; i++) {
    // Generate deformed points for this specific shape
    let shapePoints = points.map(pt => {
      return [pt[0] * 20, pt[1] * 20]; // Scale up uniformly to preserve shape
    });

    let shape = {
      x: random(0, windowWidth),
      y: random(0, windowHeight),
      dx: random(-3, 3),
      dy: random(-3, 3),
      scale: random(0.5, 1.5), // Random scale property (adjusted to 0.5-1.5 for better visibility)
      color: color(random(palette)),
      points: shapePoints
    };
    shapes.push(shape);
  }

  // Initialize bubbles
  for (let i = 0; i < 50; i++) {
    bubbles.push({
      x: random(width),
      y: random(height),
      size: random(5, 20),
      speed: random(0.5, 2)
    });
  }

  // Initialize seaweeds
  for (let i = 0; i < 40; i++) {
    seaweeds.push({
      x: random(width),
      h: random(100, 300),
      color: color(random(20, 60), random(100, 150), random(80, 130), 200) // Natural semi-transparent green
    });
  }

  // Initialize rocks
  for (let i = 0; i < 100; i++) {
    let rW = random(30, 100);
    let rH = random(20, 60);
    let rockPoints = [];
    for (let j = 0; j < 12; j++) {
      let angle = map(j, 0, 12, 0, TWO_PI);
      let rad = random(0.7, 1.3);
      rockPoints.push({
        x: cos(angle) * rW * 0.5 * rad,
        y: sin(angle) * rH * 0.5 * rad
      });
    }
    rocks.push({
      x: random(width),
      y: random(height - 50, height + 20),
      color: color(random(50, 80)),
      points: rockPoints
    });
  }
}

function draw() {
  // Set background color
  background('#415a77');

  // Draw seaweeds
  push();
  noStroke();
  for (let weed of seaweeds) {
    fill(weed.color);
    beginShape();
    let time = frameCount * 0.02;
    for (let j = 0; j <= weed.h; j += 10) {
      let y = height - j;
      let xOffset = sin(time + weed.x * 0.01 + j * 0.02) * (j * 0.08);
      let w = map(j, 0, weed.h, 24, 2); // Wider base, narrow tip
      vertex(weed.x + xOffset - w / 2, y);
    }
    for (let j = weed.h; j >= 0; j -= 10) {
      let y = height - j;
      let xOffset = sin(time + weed.x * 0.01 + j * 0.02) * (j * 0.08);
      let w = map(j, 0, weed.h, 24, 2);
      vertex(weed.x + xOffset + w / 2, y);
    }
    endShape(CLOSE);
  }
  pop();

  // Draw rocks
  push();
  noStroke();
  for (let r of rocks) {
    fill(r.color);
    push();
    translate(r.x, r.y);
    beginShape();
    for (let p of r.points) vertex(p.x, p.y);
    endShape(CLOSE);
    pop();
  }
  pop();

  // Draw bubbles
  push();
  noStroke();
  fill(255, 50);
  for (let b of bubbles) {
    b.y -= b.speed;
    b.x += random(-0.5, 0.5);
    if (b.y < -b.size) {
      b.y = height + b.size;
      b.x = random(width);
    }
    circle(b.x, b.y, b.size);
  }
  pop();

  if (muteBtn.html() === 'Mute') {
    song.setVolume(volumeSlider.value());
  }

  // Set stroke weight
  strokeWeight(2);

  // Get current volume level (0 to 1)
  let level = amplitude.getLevel();

  // Map level to size factor (0.5 to 2)
  let sizeFactor = map(level, 0, 1, 0.5, 2);

  // Update and draw each shape
  for (let shape of shapes) {
    // Update position
    shape.x += shape.dx;
    shape.y += shape.dy;

    // Bounce off edges
    if (shape.x < 0 || shape.x > windowWidth) {
      shape.dx *= -1;
    }
    if (shape.y < 0 || shape.y > windowHeight) {
      shape.dy *= -1;
    }

    // Set appearance
    fill(shape.color);
    stroke(shape.color);

    // Transformation
    push();
    let shakeX = 0;
    let shakeY = 0;
    if (isVibrating) {
      let shakeMag = map(level, 0, 1, 0, 50);
      shakeX = random(-shakeMag, shakeMag);
      shakeY = random(-shakeMag, shakeMag);
    }
    translate(shape.x + shakeX, shape.y + shakeY);
    if (shape.dx > 0) {
      scale(-sizeFactor * shape.scale, sizeFactor * shape.scale); // Flip horizontally if moving right
    } else {
      scale(sizeFactor * shape.scale); // Scale based on audio amplitude and shape's individual scale
    }

    // Draw polygon
    beginShape();
    for (let pt of shape.points) {
      vertex(pt[0], pt[1]);
    }
    endShape(CLOSE);

    // Restore state
    pop();
  }
}

// Helper to handle browser autoplay policies
function togglePlay() {
  if (song.isPlaying()) {
    song.pause();
  } else {
    song.loop();
  }
}

function toggleMute() {
  if (muteBtn.html() === 'Mute') {
    song.setVolume(0);
    muteBtn.html('Unmute');
  } else {
    song.setVolume(volumeSlider.value());
    muteBtn.html('Mute');
  }
}

function toggleVibration() {
  isVibrating = !isVibrating;
  vibrateBtn.html(isVibrating ? 'Vibrate: ON' : 'Vibrate: OFF');
}
