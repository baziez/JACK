let audioFile;
let sound;
let fft;
let bird;
let particles = [];
let smoothedHue1 = 220;
let smoothedHue2 = 100;
let Sen = 4; // Peak sensitivity value from 1.0 -
let limCol = 4; // Limiting colors value from 1.0 -
let limLine = 12; // Line limiter value from 1.0 -


function setup() {
  const canvas = createCanvas(windowWidth, windowHeight, WEBGL);
  canvas.parent('canvas-container');
  setAttributes('colorSpace', 'linear'); // Linear color space for better gradations
  colorMode(HSB, 300, 280/limCol, 280/limCol, 280/limCol);
 // colorMode(HSB, 300, 65, 65, 65);
  fft = new p5.FFT(0.8, 512);
  bird = new Bird();
  const audioFileInput = document.getElementById('audio-file');
  audioFileInput.addEventListener('change', (event) => {
    if (sound && sound.isPlaying()) {
      sound.stop();
    }
    audioFile = event.target.files[0];
    sound = loadSound(URL.createObjectURL(audioFile), () => fft.setInput(sound));
  });

  const startButton = document.getElementById('start-button');
  startButton.addEventListener('click', () => {
    if (sound && !sound.isPlaying()) {
      sound.play();
    }
  });
}

function draw() {
  fft.analyze();
  const bass = fft.getEnergy("bass");
  const mid = fft.getEnergy("mid");
  const treble = fft.getEnergy("treble");
  const level = fft.getEnergy(20, 20000) / 255;

  // Dynamic sky background
// Smooth hue1 and hue2 to avoid abrupt changes
  const targetHue1 = map(-70 + bass/(2/Sen), 0, 255 - bass/(1.8/Sen), 220 - bass/(1.8/Sen), 360);
  const targetHue2 = map(20 + treble/(2/Sen) - mid/(2/Sen), 0, 225 - treble/(2/Sen), 100, 20);
  smoothedHue1 = lerp(smoothedHue1, targetHue1, 0.1); // Smooth with 10% lerp
  smoothedHue2 = lerp(smoothedHue2, targetHue2, 0.1);

  // Normalize hue and boost saturation/brightness for Rec. 709
  const c1Hue = (smoothedHue1 * 1.6 - 145) % 360; // Prevent hue wrapping
  const c2Hue = ((smoothedHue2 * 1.2 - 90) + 360) % 360; // Handle negative hues
  const c1Sat = constrain(30 + (smoothedHue1 / 20), 40, 70); // Higher saturation
  const c1Bri = constrain(20 + (smoothedHue1 / 50), 40, 80); // Higher brightness
  const c2Sat = constrain(26 + (smoothedHue2 / 80), 40, 70);
  const c2Bri = constrain(8 + (smoothedHue2 / 30), 40, 80);

  drawGradientBackground(
    color(c1Hue, c1Sat, c1Bri),
    color(c2Hue, c2Sat, c2Bri)
  );

  // Set up lighting
  ambientLight(10 + level + treble/(32/Sen) + bass/(24/Sen) - mid/(24/Sen));
  pointLight(color(30, 70, 40), -200, -200, -200); 
  pointLight(color(167, 110, 220), 200, 200, 200); 
  drawStarfield(level);
  bird.update(level, bass, mid, treble);
  bird.display();
  
  // Draw particles
  for (let i = particles.length - 1; i >= 0; i--) {
    particles[i].update();
    particles[i].display();
    if (particles[i].isFinished()) {
      particles.splice(i, 1);
    }
  }
  
}

function drawGradientBackground(c1, c2) {
  push();
  translate(0, 0, -width);
  noStroke();
  // Use fewer steps for performance
//  let steps = 700;
  let steps = 100/limLine;
  for (let i = 0; i <= steps; i++) {
    let inter = lerpColor(c1, c2, i / steps);
    fill(inter);
    let y = map(i, 0, steps, -height, height);
    beginShape();
    vertex(-width, y + height, 0);
    vertex(width, y + height, 0);
    vertex(width, y + height / steps, 0);
    vertex(-width, y + height / steps, 0);
    endShape(CLOSE);
  }
  // Simplified dithering: sparse noise
  for (let i = 0; i < 200; i++) { // Fixed number of noise points
    push();
    noStroke();
    fill(random(-3, 3), random(-3, 3), random(-3, 3), 8); // Subtle noise
    translate(
      random(-width, width),
      random(-height, height),
      -width + 1
    );
    rect(0, 0, 8, 8);
    pop();
  }
  pop();
}

function drawStarfield(level) {
    push();
    noStroke();
    // More stars when the music is louder
    const starCount = map(level, 0, 1, 100, 500);
    for (let i = 0; i < starCount; i++) {
        fill(360, 0, 100, random(20, 80)); // White stars with varying opacity
        const x = (noise(i * 0.1, frameCount * 0.001) - 0.5) * width * 2;
        const y = (noise(i * 0.2, frameCount * 0.001) - 0.5) * height * 2;
        const z = (noise(i * 0.3, frameCount * 0.001) - 1) * width;
        push();
        translate(x, y, z);
        sphere(map(level*5, 0, 1, 0.5, 2));
        pop();
    }

    pop();
}


class Bird {
  constructor() {
    this.pos = createVector(0, 0, 0);
    this.wingAngle = 0;
    this.headAngle = 0;
    this.tailAngle = 0;
    this.breath = 0;
    this.iridescence = 0;
  }

  update(level, bass, mid, treble) {
    // Smooth, powerful wing flaps
    this.wingAngle = map(level, 0, 1, 0.1, PI / 2.5);

    // Head bobbing to the mid-range
    this.headAngle = map(mid*2, 0, 255, -PI / 4, PI / 4);
    
    // Tail fanning with the bass
    this.tailAngle = map(bass, 0, 255, 0, PI / 8);

    // Subtle breathing animation
    this.breath = sin(frameCount * 0.052) * 2;
    
    // Feather iridescence based on treble
    this.iridescence = map((treble/1.8) - (mid/2.2), 0, 255/(mid/30), 200, 320); // Blues to Purples

    // Emit "exhaust" particles
    if (bass > 221 && frameCount % 2 === 0) {
      const particlePos = this.pos.copy().add(createVector(-16, 27, 0));
      particles.push(new Particle(particlePos, this.iridescence));
    }
    // Emit "exhaust" particles
    if (bass > 221 && frameCount % 2 === 0) {
      const particlePos = this.pos.copy().add(createVector(16, 27, 0));
      particles.push(new Particle(particlePos, this.iridescence));
    }
    // Emit "exhaust" particles
    if (bass > 250 && frameCount % 1 === 0) {
      const particlePos = this.pos.copy().add(createVector(-16, 30, 0));
      particles.push(new Particle(particlePos, this.iridescence));
    }
    // Emit "exhaust" particles
    if (bass > 250 && frameCount % 1 === 0) {
      const particlePos = this.pos.copy().add(createVector(16, 30, 0));
      particles.push(new Particle(particlePos, this.iridescence));
    }
    
    
    
    // Emit "singing" particles
    if (treble > 81 && frameCount % 2 === 0) {
      const particlePos = this.pos.copy().add(createVector(17, -35, 0));
      particles.push(new ParticleV(particlePos, this.iridescence));
    }    
    // Emit "singing" particles
    if (treble > 107 && frameCount % 1 === 0) {
      const particlePos = this.pos.copy().add(createVector(18, -35, 0));
      particles.push(new ParticleV(particlePos, this.iridescence));
    }
    if (treble > 121 && frameCount % 1 === 0) {
      const particlePos = this.pos.copy().add(createVector(19, -35, 0));
      particles.push(new ParticleV(particlePos, this.iridescence));
    }
    
    
  }

  display() {
    push();
    translate(this.pos.x, this.pos.y, this.pos.z);
    
    // Set material for the bird
    specularMaterial(this.iridescence+this.headAngle, 172, 172);
    shininess(100);
    
    // Body
    push();
    translate(0, 0, 0);
    sphere(30 + this.breath, 60, 60);
    pop();
    
    // Head
    push();
    translate(0, -40, 0);
    sphere(18, 60, 60);
    rotateY(this.headAngle);
    // Beak
    translate(0, 3, 15);
    cone(8, 17, 32);
    
    pop();

    // Wings
    this.drawWing(-1); // Left
    this.drawWing(1);  // Right

    // Tail
    push();
    translate(0, 40, -25);
    rotateX(-PI / 4 + this.tailAngle);
    fill(240, 80, 20);
    specularMaterial(this.iridescence, 80, 80);
    beginShape();
    vertex(0, -30, 0);
    vertex(-20, 40, 0);
    vertex(0, 50, 0);
    vertex(20, 40, 0);
    endShape(CLOSE);
    pop();

    pop();
  }

  drawWing(side) {
    push();
    fill(this.iridescence, 80, 60);
    specularMaterial(this.iridescence, 80, 80);
    translate(side * 25, -20, 0);
    rotateZ(side * this.wingAngle);
    beginShape();
    vertex(0, 0, 0);
    vertex(side * 60, 0, 5);
    vertex(side * 50, 70, 5);
    vertex(side * 10, 10, 0);
    endShape(CLOSE);
    pop();
  }
}

class Particle {
  constructor(origin, hue) {
    this.pos = origin.copy();
    const angle = random(TWO_PI);
    const z_angle = random(PI/2);
    this.vel = createVector(
      random(-0.2, 0.2), // X drift
      -random(0.5, 1.5), // Y downward
      random(-0.2, 0.2)  // Z drift
    ).mult(random(0.5, 1.5)); // Randomize speed
    
    
    this.lifespan = 200;
    this.hue = hue + random(-20, 20);
    this.size = random(0.3, 5.1);
  }

  update() {
    this.pos.add(this.vel);
    this.vel.y += 3.01; // a little gravity
    this.lifespan -= 3.8;
  }

  display() {
    push();
    noStroke();
    fill(this.hue, 80, 100, this.lifespan / 4);
    translate(this.pos.x, this.pos.y, this.pos.z);
    sphere(this.size);
    pop();
  }

  isFinished() {
    return this.lifespan <= 0;
  }
}

class ParticleV {
  constructor(origin, hue) {
    this.pos = origin.copy();
    const angle = random(TWO_PI);
    const z_angle = random(PI/2);
      this.vel = createVector(cos(angle)*sin(z_angle), -abs(sin(angle)*sin(z_angle)), cos(z_angle)).mult(random(1, 3));
    
    this.lifespan = 200;
    this.hue = hue + random(-20, 20);
    this.size = random(1.3, 3.1);
  }

  update() {
    this.pos.add(this.vel);
    this.vel.y += 0.02 + random(-0.01, 0.1); // a little gravity
    this.vel.x += 0.5; // a little gravity
    this.lifespan -= 4.8;
  }

  display() {
    push();
    noStroke();
    fill(this.hue, 80, 100, this.lifespan / 4);
    translate(this.pos.x, this.pos.y, this.pos.z);
    sphere(this.size);
    pop();
  }

  isFinished() {
    return this.lifespan <= 0;
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

