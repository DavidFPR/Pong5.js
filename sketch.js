let anchoCanvas = 800;
let altoCanvas = 400;

let jugadorX = 15;
let jugadorY;
let anchoRaqueta = 10; // Set placeholder dimensions for images
let altoRaqueta = 100;

let computadoraX = anchoCanvas - 25;
let computadoraY;

let pelotaX, pelotaY;
let diametroPelota = 20;
let velocidadPelota = 5;
let velocidadPelotaX, velocidadPelotaY;
let incrementoVelocidad = 0.2; // Speed increment after each bounce
let velocidadInicial = 5; // Initial speed to reset upon scoring
let isImageLoaded = false; // Flag to track whether the image has been loaded

let grosorMarco = 5;

// Scores
let jugadorScore = 0;
let computadoraScore = 0;

let fondo; // Variable to hold the background image
let barra1; // Variable to hold the player paddle image
let barra2; // Variable to hold the AI paddle image
let bola; // Variable to hold the ball image

// For spin
let spin = 0; // Initialize spin angle of the ball
let spinSpeed = 0.1; // The rate at which the ball spins

let bounceSound; // Variable to store the bounce sound
let goalSound; // Variable to store the goal sound
let winSound; // Variable to store the win sound
let loseSound; // Variable to store the lose sound
let myVoice; // Variable to hold the p5.Speech object

let gameStarted = false; // Flag to indicate if the game has started
let gameOver = false; // Flag to indicate if the game is over

function preload() {
    fondo = loadImage('assets/images/fondo1.png');
    barra1 = loadImage('assets/images/barra1.png');
    barra2 = loadImage('assets/images/barra2.png');
    bola = loadImage('assets/images/bola.png');
    
    // Preload the sounds
    bounceSound = loadSound('assets/sounds/bounce.wav');
    goalSound = loadSound('assets/sounds/chime.wav');
    winSound = loadSound('assets/sounds/game_won.wav');
    loseSound = loadSound('assets/sounds/game_over.wav');
}

function setup() {
    createCanvas(anchoCanvas, altoCanvas);
    myVoice = new p5.Speech(); // Create the speech object
    jugadorY = height / 2 - altoRaqueta / 2;
    computadoraY = height / 2 - altoRaqueta / 2;
    resetPelota(); // Initialize velocity and position
    textFont("Electrolize"); // Set the font for the text
}

function draw() {
    background(0); // Fallback to black background if the image fails to load
    if (fondo) {
        image(fondo, 0, 0, width, height); // Draw the background image if it's loaded
    } else {
        console.log("Fondo image is not loaded yet."); // Check if fondo is still null or undefined
    }
    dibujarMarcos();
    dibujarRaquetas();
    dibujarPelota();
    dibujarPuntuacion(); // Draw the score
    
    if (!gameStarted) {
        mostrarTextoInicio();
    } else if (!gameOver) {
        moverPelota();
        moverComputadora();
        verificarColisiones();
        moverJugador(); // Smooth player movement
    } else {
        mostrarTextoFin();
    }
}

function dibujarMarcos() {
    fill(color("#00faff"));
    rect(0, 0, width, grosorMarco); // Top wall
    rect(0, height - grosorMarco, width, grosorMarco); // Bottom wall
}

function dibujarRaquetas() {
    if (barra1 && barra2) {
        image(barra1, jugadorX, jugadorY, anchoRaqueta, altoRaqueta); // Player paddle image
        image(barra2, computadoraX, computadoraY, anchoRaqueta, altoRaqueta); // AI paddle image
    } else {
        fill(255);
        rect(jugadorX, jugadorY, anchoRaqueta, altoRaqueta);
        rect(computadoraX, computadoraY, anchoRaqueta, altoRaqueta);
    }
}

function dibujarPelota() {
    if (bola) {
        push(); // Save current drawing state
        translate(pelotaX, pelotaY); // Move origin to the center of the ball
        rotate(spin); // Rotate the ball based on its spin
        imageMode(CENTER); // Draw the image centered
        image(bola, 0, 0, diametroPelota, diametroPelota); // Ball image
        pop(); // Restore drawing state
    } else {
        fill(255);
        ellipse(pelotaX, pelotaY, diametroPelota, diametroPelota);
    }
}

function dibujarPuntuacion() {
    textSize(32);
    fill(color("#00faff"));
    textAlign(CENTER, TOP);
    text(`Player: ${jugadorScore}`, width / 4, 20);
    text(`AI: ${computadoraScore}`, (3 * width) / 4, 20);
}

function moverPelota() {
    pelotaX += velocidadPelotaX;
    pelotaY += velocidadPelotaY;

    // Apply spin speed to the ball (increase spin with the ball's speed)
    spin += velocidadPelota * spinSpeed;

    // Bounce off top and bottom walls
    if (pelotaY - diametroPelota / 2 < grosorMarco || 
        pelotaY + diametroPelota / 2 > height - grosorMarco) {
        velocidadPelotaY *= -1;
        aumentarVelocidad(); // Increase speed upon bouncing off wall
        bounceSound.play(); // Play the bounce sound
    }
}

function moverComputadora() {
    if (pelotaY > computadoraY + altoRaqueta / 2) {
        computadoraY += 4;
    } else if (pelotaY < computadoraY + altoRaqueta / 2) {
        computadoraY -= 4;
    }
    computadoraY = constrain(computadoraY, grosorMarco, height - grosorMarco - altoRaqueta);
}

function verificarColisiones() {
    // Collision with player paddle
    if (pelotaX - diametroPelota / 2 < jugadorX + anchoRaqueta && 
        pelotaY > jugadorY && pelotaY < jugadorY + altoRaqueta) {
        
        let impacto = (pelotaY - (jugadorY + altoRaqueta / 2)) / (altoRaqueta / 2); // -1 to 1
        let angle = impacto * (PI / 4); // Convert impact position to angle (-45 to 45 degrees)
        
        velocidadPelotaX = velocidadPelota * cos(angle); // Adjust X velocity
        velocidadPelotaY = velocidadPelota * sin(angle); // Adjust Y velocity
        velocidadPelotaX = abs(velocidadPelotaX); // Ensure it moves right
        aumentarVelocidad(); // Increase speed upon bouncing off paddle
        bounceSound.play(); // Play the bounce sound
    }

    // Collision with computer paddle
    if (pelotaX + diametroPelota / 2 > computadoraX && 
        pelotaY > computadoraY && pelotaY < computadoraY + altoRaqueta) {
        
        let impacto = (pelotaY - (computadoraY + altoRaqueta / 2)) / (altoRaqueta / 2); // -1 to 1
        let angle = impacto * (PI / 4); // Convert impact position to angle (-45 to 45 degrees)
        
        velocidadPelotaX = velocidadPelota * cos(angle); // Adjust X velocity   
        velocidadPelotaY = velocidadPelota * sin(angle); // Adjust Y velocity
        velocidadPelotaX = -abs(velocidadPelotaX); // Ensure it moves left
        aumentarVelocidad(); // Increase speed upon bouncing off paddle
        bounceSound.play(); // Play the bounce sound
    }

    // Check if ball passes the left or right edge (score for the other player)
    if (pelotaX < 0) {
        computadoraScore += 1; // AI scores
        goalSound.play();
        if (computadoraScore >= 1) {
            gameOver = true;
            loseSound.play();
            myVoice.speak("You lose");
        }
        resetPelota();
    } else if (pelotaX > width) {
        jugadorScore += 1; // Player scores
        goalSound.play();
        if (jugadorScore >= 1) {
            gameOver = true;
            winSound.play();
            myVoice.speak("You win");
        }
        resetPelota();
    }
}

function resetPelota() {
    pelotaX = width / 2;
    pelotaY = height / 2;
    velocidadPelota = velocidadInicial; // Reset to initial speed
    
    let angle = random(-PI / 4, PI / 4); // Random initial angle between -45 and 45 degrees
    velocidadPelotaX = velocidadPelota * cos(angle);
    velocidadPelotaY = velocidadPelota * sin(angle);

    // Ensure ball moves toward the player who last scored
    velocidadPelotaX *= random([-1, 1]);
}

function aumentarVelocidad() {
    velocidadPelota += incrementoVelocidad; // Increment speed slightly
    let angle = atan2(velocidadPelotaY, velocidadPelotaX); // Get current direction of the ball
    velocidadPelotaX = velocidadPelota * cos(angle); // Update X component
    velocidadPelotaY = velocidadPelota * sin(angle); // Update Y component
}

function moverJugador() {
    // Smooth player movement with arrow keys only
    if (keyIsDown(UP_ARROW)) {
        jugadorY -= 5;
    }
    if (keyIsDown(DOWN_ARROW)) {
        jugadorY += 5;
    }
    jugadorY = constrain(jugadorY, grosorMarco, height - grosorMarco - altoRaqueta);
}
function mostrarTextoInicio() {
    textSize(36);
    textFont("Electrolize");
    fill(color("#FFDD33"));
    textAlign(CENTER, CENTER);
    text("Click to play!", width / 2, height / 2);
}

function mostrarTextoFin() {
    textSize(64);
    textFont("Electrolize");
    fill(color("#FF3333"));
    textAlign(CENTER, CENTER);
    text(jugadorScore >= 1 ? "YOU WIN!" : "YOU LOSE!", width / 2, height / 2);
}

function mousePressed() {
    if (!gameStarted) {
        gameStarted = true;
    }
    if (gameOver) {
        jugadorScore = 0;
        computadoraScore = 0;
        gameOver = false;
        gameStarted = false;
        resetPelota();
    }
}
